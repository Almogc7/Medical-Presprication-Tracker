"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { getSession } from "@/lib/auth";
import { addTrackedPerson, removeTrackedPerson } from "@/services/family-service";

export async function addPersonAction(formData: FormData) {
  const session = await getSession();
  if (!session) {
    redirect("/login");
  }

  const fullName = String(formData.get("fullName") || "");
  const note = String(formData.get("note") || "");

  try {
    await addTrackedPerson({ fullName, note });
    revalidatePath("/people");
    redirect("/people?success=added");
  } catch (error) {
    const message = error instanceof Error ? error.message : "Could not add person";
    redirect(`/people?error=${encodeURIComponent(message)}`);
  }
}

export async function removePersonAction(formData: FormData) {
  const session = await getSession();
  if (!session) {
    redirect("/login");
  }

  const personId = String(formData.get("personId") || "");

  if (!personId) {
    redirect("/people?error=Missing%20person%20id");
  }

  try {
    await removeTrackedPerson(personId);
    revalidatePath("/people");
    redirect("/people?success=removed");
  } catch (error) {
    const message = error instanceof Error ? error.message : "Could not remove person";
    redirect(`/people?error=${encodeURIComponent(message)}`);
  }
}
