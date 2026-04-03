import { cookies } from "next/headers";
import { NextResponse } from "next/server";

import { LOCALE_COOKIE } from "@/lib/constants";
import { isLocale } from "@/lib/i18n";

export async function POST(request: Request) {
  const body = (await request.json()) as { locale?: string };

  if (!body.locale || !isLocale(body.locale)) {
    return NextResponse.json({ error: "Invalid locale" }, { status: 400 });
  }

  const cookieStore = await cookies();
  cookieStore.set(LOCALE_COOKIE, body.locale, {
    sameSite: "lax",
    httpOnly: false,
    secure: process.env.NODE_ENV === "production",
    path: "/",
  });

  return NextResponse.json({ ok: true });
}
