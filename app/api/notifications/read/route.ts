import { NextResponse } from "next/server";

import { getApiSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  const session = await getApiSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = (await request.json()) as { id?: string };

  if (!body.id) {
    return NextResponse.json({ error: "Missing id" }, { status: 400 });
  }

  await prisma.notification.update({
    where: { id: body.id },
    data: { isRead: true },
  });

  return NextResponse.json({ ok: true });
}
