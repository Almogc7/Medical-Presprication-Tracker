import { hash } from "bcryptjs";
import { addDays, subDays } from "date-fns";

import { prisma } from "../lib/prisma";
import { MAX_TRACKED_PEOPLE } from "../lib/constants";

async function main() {
  await prisma.user.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.auditLog.deleteMany();
  await prisma.prescription.deleteMany();
  await prisma.person.deleteMany();

  const ownerEmail = process.env.ADMIN_EMAIL || "admin@prescription.local";
  const ownerPassword = process.env.ADMIN_PASSWORD || "Admin#2026!Tracker";
  const passwordHash = await hash(ownerPassword, 12);

  await prisma.user.create({
    data: {
      email: ownerEmail,
      passwordHash,
    },
  });

  const people = await prisma.$transaction([
    prisma.person.create({ data: { fullName: "Almog Levi", note: "Primary" } }),
    prisma.person.create({ data: { fullName: "Noa Cohen" } }),
    prisma.person.create({ data: { fullName: "Eitan Mizrahi" } }),
    prisma.person.create({ data: { fullName: "Yael Ben David" } }),
  ]);

  if (people.length > MAX_TRACKED_PEOPLE) {
    throw new Error(`Seed violates tracked family limit (${MAX_TRACKED_PEOPLE}).`);
  }

  const now = new Date();

  const prescriptions = await prisma.$transaction([
    prisma.prescription.create({
      data: {
        personId: people[0].id,
        title: "Tikun Olam Batch A",
        pdfPath: "uploads/prescriptions/sample-1.pdf",
        originalFileName: "sample-1.pdf",
        startDate: subDays(now, 5),
        expirationDate: addDays(now, 25),
        status: "active",
      },
    }),
    prisma.prescription.create({
      data: {
        personId: people[1].id,
        title: "Night Formula",
        pdfPath: "uploads/prescriptions/sample-2.pdf",
        originalFileName: "sample-2.pdf",
        startDate: subDays(now, 20),
        expirationDate: addDays(now, 6),
        status: "active",
      },
    }),
    prisma.prescription.create({
      data: {
        personId: people[2].id,
        title: "Expired Document",
        pdfPath: "uploads/prescriptions/sample-3.pdf",
        originalFileName: "sample-3.pdf",
        startDate: subDays(now, 70),
        expirationDate: subDays(now, 2),
        status: "expired",
      },
    }),
    prisma.prescription.create({
      data: {
        personId: people[3].id,
        title: "Issued Prescription",
        pdfPath: "uploads/prescriptions/sample-4.pdf",
        originalFileName: "sample-4.pdf",
        startDate: subDays(now, 30),
        expirationDate: addDays(now, 10),
        status: "issued",
        issuedAt: subDays(now, 1),
      },
    }),
  ]);

  await prisma.notification.createMany({
    data: [
      {
        prescriptionId: prescriptions[1].id,
        type: "expiring_7d",
        title: "Prescription expires in 7 days",
        message: "Night Formula expires soon.",
        severity: "high",
        scheduledFor: now,
      },
      {
        prescriptionId: prescriptions[2].id,
        type: "expired",
        title: "Prescription expired",
        message: "Expired Document has expired.",
        severity: "critical",
        scheduledFor: now,
      },
    ],
  });

  await prisma.auditLog.createMany({
    data: [
      {
        prescriptionId: prescriptions[3].id,
        action: "issued",
        details: "Seeded as issued",
      },
    ],
  });
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
