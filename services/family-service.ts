import { MAX_TRACKED_PEOPLE } from "@/lib/constants";
import { prisma } from "@/lib/prisma";

export async function getTrackedPeople() {
  const people = await prisma.person.findMany({
    select: { id: true, fullName: true },
    orderBy: { fullName: "asc" },
  });

  if (people.length > MAX_TRACKED_PEOPLE) {
    throw new Error(`Tracked people limit exceeded (${MAX_TRACKED_PEOPLE}).`);
  }

  return people;
}

export async function assertTrackedFamilyIntegrity() {
  const count = await prisma.person.count();

  if (count > MAX_TRACKED_PEOPLE) {
    throw new Error(`Tracked people limit exceeded (${MAX_TRACKED_PEOPLE}).`);
  }
}

export async function ensureTrackedPersonExists(personId: string) {
  await assertTrackedFamilyIntegrity();

  const person = await prisma.person.findUnique({
    where: { id: personId },
    select: { id: true },
  });

  if (!person) {
    throw new Error("Person not found in tracked family list.");
  }

  return person;
}

export async function addTrackedPerson(input: { fullName: string; note?: string }) {
  const fullName = input.fullName.trim();

  if (!fullName) {
    throw new Error("Full name is required.");
  }

  await assertTrackedFamilyIntegrity();

  const count = await prisma.person.count();
  if (count >= MAX_TRACKED_PEOPLE) {
    throw new Error(`You can track up to ${MAX_TRACKED_PEOPLE} people.`);
  }

  return prisma.person.create({
    data: {
      fullName,
      note: input.note?.trim() || null,
    },
  });
}

export async function removeTrackedPerson(personId: string) {
  const person = await prisma.person.findUnique({
    where: { id: personId },
    select: { id: true },
  });

  if (!person) {
    throw new Error("Person not found.");
  }

  await prisma.person.delete({
    where: { id: personId },
  });
}
