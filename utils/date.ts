import { addDays, differenceInCalendarDays, isBefore, isSameDay, startOfDay } from "date-fns";
import type { PrescriptionStatus } from "@/types/domain";

export const ISRAEL_TIME_ZONE = "Asia/Jerusalem";

export function formatDateInIsrael(date: Date) {
  const formatter = new Intl.DateTimeFormat("en-CA", {
    timeZone: ISRAEL_TIME_ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });

  const parts = formatter.formatToParts(date);
  const year = parts.find((part) => part.type === "year")?.value;
  const month = parts.find((part) => part.type === "month")?.value;
  const day = parts.find((part) => part.type === "day")?.value;

  if (!year || !month || !day) {
    throw new Error("Could not format date in Israel timezone");
  }

  return `${year}-${month}-${day}`;
}

export function parseIsraelDateInput(value: string) {
  const match = value.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!match) {
    throw new Error("Invalid date input format. Expected yyyy-MM-dd");
  }

  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);

  // Use UTC noon to keep the same calendar date across timezone conversions.
  return new Date(Date.UTC(year, month - 1, day, 12, 0, 0));
}

export function daysUntilExpiration(expirationDate: Date, now = new Date()) {
  return differenceInCalendarDays(startOfDay(expirationDate), startOfDay(now));
}

export function isExpired(expirationDate: Date, now = new Date()) {
  return isBefore(startOfDay(expirationDate), startOfDay(now));
}

export function isExpiringSoon(expirationDate: Date, days = 30, now = new Date()) {
  const remaining = daysUntilExpiration(expirationDate, now);
  return remaining >= 0 && remaining <= days;
}

export function getExpirationSeverity(expirationDate: Date, now = new Date()) {
  const remaining = daysUntilExpiration(expirationDate, now);

  if (remaining < 0) {
    return "expired" as const;
  }

  if (remaining <= 1) {
    return "critical" as const;
  }

  if (remaining <= 7) {
    return "high" as const;
  }

  if (remaining <= 14) {
    return "medium" as const;
  }

  if (remaining <= 30) {
    return "low" as const;
  }

  return "none" as const;
}

export function autoStatusUpdate(input: {
  expirationDate: Date;
  currentStatus: PrescriptionStatus;
  issuedAt: Date | null;
  now?: Date;
}): PrescriptionStatus {
  const { expirationDate, currentStatus, issuedAt, now = new Date() } = input;

  if (issuedAt || currentStatus === "issued") {
    return "issued";
  }

  if (isExpired(expirationDate, now)) {
    return "expired";
  }

  return "active";
}

export function matchesThreshold(expirationDate: Date, thresholdDays: number, now = new Date()) {
  const target = addDays(startOfDay(now), thresholdDays);
  return isSameDay(startOfDay(expirationDate), target);
}
