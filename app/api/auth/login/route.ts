import { NextResponse } from "next/server";

import { login } from "@/lib/auth";

export async function POST(request: Request) {
  const formData = await request.formData();

  const email = String(formData.get("email") || "");
  const password = String(formData.get("password") || "");

  const ok = await login(email, password);

  if (!ok) {
    return NextResponse.redirect(new URL("/login?error=1", request.url));
  }

  return NextResponse.redirect(new URL("/dashboard", request.url));
}
