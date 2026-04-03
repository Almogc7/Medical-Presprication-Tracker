"use server";

import { revalidatePath } from "next/cache";

import { getSession, logout } from "@/lib/auth";
import { deletePrescription, markPrescriptionIssued, undoPrescriptionIssued } from "@/services/prescription-service";

export async function markIssuedAction(id: string) {
  const session = await getSession();
  if (!session) {
    throw new Error("Unauthorized");
  }

  await markPrescriptionIssued(id);
  revalidatePath("/dashboard");
  revalidatePath("/people");
  revalidatePath("/notifications");
}

export async function undoIssuedAction(id: string) {
  const session = await getSession();
  if (!session) {
    throw new Error("Unauthorized");
  }

  await undoPrescriptionIssued(id);
  revalidatePath("/dashboard");
  revalidatePath("/people");
  revalidatePath("/notifications");
}

export async function deletePrescriptionAction(id: string) {
  const session = await getSession();
  if (!session) {
    throw new Error("Unauthorized");
  }

  await deletePrescription(id);
  revalidatePath("/dashboard");
  revalidatePath("/people");
  revalidatePath("/notifications");
}

export async function logoutAction() {
  await logout();
  revalidatePath("/");
}
