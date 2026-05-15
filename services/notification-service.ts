import { EXPIRATION_THRESHOLDS, TELEGRAM_ALERT_THRESHOLD_DAYS } from "@/lib/constants";
import { prisma } from "@/lib/prisma";
import { sendTelegramMessage } from "@/lib/telegram";
import type { NotificationSeverity } from "@/types/domain";
import { daysUntilExpiration, isExpired, matchesThreshold } from "@/utils/date";

function buildSeverity(days: number) {
  if (days <= 1) {
    return "critical" satisfies NotificationSeverity;
  }

  if (days <= 7) {
    return "high" satisfies NotificationSeverity;
  }

  if (days <= 14) {
    return "medium" satisfies NotificationSeverity;
  }

  return "low" satisfies NotificationSeverity;
}

export async function generateNotificationsForThresholds() {
  const prescriptions = await prisma.prescription.findMany({
    where: {
      status: "active",
    },
    include: {
      person: true,
    },
  });

  const now = new Date();

  for (const prescription of prescriptions) {
    if (isExpired(prescription.expirationDate, now)) {
      await prisma.notification.upsert({
        where: {
          prescriptionId_type: {
            prescriptionId: prescription.id,
            type: "expired",
          },
        },
        update: {},
        create: {
          prescriptionId: prescription.id,
          type: "expired",
          title: "Prescription expired",
          message: `${prescription.title} for ${prescription.person.fullName} has expired.`,
          severity: "critical",
          scheduledFor: now,
        },
      });

      continue;
    }

    const daysRemaining = daysUntilExpiration(prescription.expirationDate, now);

    for (const threshold of EXPIRATION_THRESHOLDS) {
      if (!matchesThreshold(prescription.expirationDate, threshold, now)) {
        continue;
      }

      await prisma.notification.upsert({
        where: {
          prescriptionId_type: {
            prescriptionId: prescription.id,
            type: `expiring_${threshold}d`,
          },
        },
        update: {},
        create: {
          prescriptionId: prescription.id,
          type: `expiring_${threshold}d`,
          title: `Prescription expires in ${daysRemaining} day(s)`,
          message: `${prescription.title} for ${prescription.person.fullName} expires in ${daysRemaining} day(s).`,
          severity: buildSeverity(daysRemaining),
          scheduledFor: now,
        },
      });
    }
  }
}

export async function unreadNotificationCount() {
  return prisma.notification.count({ where: { isRead: false } });
}

export async function sendLicenseRenewalAlertsIfNeeded(): Promise<void> {
  const configured = process.env.TELEGRAM_BOT_TOKEN && process.env.TELEGRAM_CHAT_ID;
  if (!configured) return;

  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const todayEnd = new Date(todayStart.getTime() + 24 * 60 * 60 * 1000);

  // Find people who have exactly 1 active prescription and it starts today
  const people = await prisma.person.findMany({
    include: {
      prescriptions: {
        where: { status: "active" },
      },
    },
  });

  for (const person of people) {
    if (person.prescriptions.length !== 1) continue;

    const last = person.prescriptions[0];
    const startsToday = last.startDate >= todayStart && last.startDate < todayEnd;
    if (!startsToday) continue;

    // Upsert the in-app notification
    const notification = await prisma.notification.upsert({
      where: {
        prescriptionId_type: {
          prescriptionId: last.id,
          type: "license_renewal",
        },
      },
      update: {},
      create: {
        prescriptionId: last.id,
        type: "license_renewal",
        title: "License renewal required",
        message: `${person.fullName} has only 1 prescription left. Time to renew the medical license.`,
        severity: "high",
        scheduledFor: now,
      },
    });

    if (notification.telegramSentAt) continue;

    try {
      await sendTelegramMessage(
        `License Renewal Reminder: "${person.fullName}" is now on their last prescription ("${last.title}"). Please renew the medical license.`,
      );
      await prisma.notification.update({
        where: { id: notification.id },
        data: { telegramSentAt: now },
      });
    } catch (error) {
      console.error(`License renewal alert failed for ${person.fullName}:`, error);
    }
  }
}

type SendTelegramOptions = {
  thresholdDays?: number;
};

export async function sendTelegramAlertsIfNeeded(options?: SendTelegramOptions): Promise<void> {
  const configured =
    process.env.TELEGRAM_BOT_TOKEN &&
    process.env.TELEGRAM_CHAT_ID;

  if (!configured) {
    return;
  }

  const thresholds = options?.thresholdDays != null
    ? [options.thresholdDays]
    : TELEGRAM_ALERT_THRESHOLD_DAYS;

  for (const thresholdDays of thresholds) {
    const notificationType = `expiring_${thresholdDays}d`;

    const pending = await prisma.notification.findMany({
      where: {
        type: notificationType,
        telegramSentAt: null,
      },
      include: {
        prescription: {
          include: { person: true },
        },
      },
    });

    for (const notification of pending) {
      try {
        const { title, person } = notification.prescription;
        await sendTelegramMessage(
          `Prescription Alert: "${title}" for ${person.fullName} expires in ${thresholdDays} days. Please take action.`,
        );
        await prisma.notification.update({
          where: { id: notification.id },
          data: { telegramSentAt: new Date() },
        });
      } catch (error) {
        console.error(
          `Telegram alert failed for notification ${notification.id}:`,
          error,
        );
      }
    }
  }
}
