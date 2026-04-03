import crypto from "node:crypto";
import { compare } from "bcryptjs";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { SESSION_COOKIE } from "@/lib/constants";
import { prisma } from "@/lib/prisma";

const SESSION_TTL_SECONDS = 60 * 60 * 24 * 7;

type SessionPayload = {
  userId: string;
  email: string;
  exp: number;
};

function base64UrlEncode(input: string) {
  return Buffer.from(input).toString("base64url");
}

function base64UrlDecode(input: string) {
  return Buffer.from(input, "base64url").toString("utf8");
}

function getSessionSecret() {
  const secret = process.env.SESSION_SECRET;
  if (!secret) {
    throw new Error("SESSION_SECRET is not configured");
  }

  return secret;
}

function sign(value: string) {
  return crypto.createHmac("sha256", getSessionSecret()).update(value).digest("base64url");
}

function createToken(payload: SessionPayload) {
  const encoded = base64UrlEncode(JSON.stringify(payload));
  const signature = sign(encoded);
  return `${encoded}.${signature}`;
}

function verifyToken(token: string): SessionPayload | null {
  const [encoded, signature] = token.split(".");
  if (!encoded || !signature) {
    return null;
  }

  const expected = sign(encoded);
  if (expected !== signature) {
    return null;
  }

  try {
    const payload = JSON.parse(base64UrlDecode(encoded)) as SessionPayload;
    if (!payload.exp || Date.now() > payload.exp) {
      return null;
    }

    return payload;
  } catch {
    return null;
  }
}

async function getSingleOwner() {
  const owners = await prisma.user.findMany({
    orderBy: { createdAt: "asc" },
    take: 2,
  });

  if (owners.length !== 1) {
    return null;
  }

  return owners[0];
}

export async function login(email: string, password: string) {
  const owner = await getSingleOwner();

  if (!owner || owner.email !== email) {
    return false;
  }

  const validPassword = await compare(password, owner.passwordHash);
  if (!validPassword) {
    return false;
  }

  const cookieStore = await cookies();
  const token = createToken({
    userId: owner.id,
    email,
    exp: Date.now() + SESSION_TTL_SECONDS * 1000,
  });

  cookieStore.set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: SESSION_TTL_SECONDS,
  });

  return true;
}

export async function logout() {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE);
}

export async function getSession() {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;

  if (!token) {
    return null;
  }

  const session = verifyToken(token);
  if (!session) {
    return null;
  }

  const owner = await getSingleOwner();
  if (!owner || owner.id !== session.userId || owner.email !== session.email) {
    return null;
  }

  return session;
}

export async function getApiSession() {
  return getSession();
}

export async function requireAuth() {
  const session = await getSession();

  if (!session) {
    redirect("/login");
  }

  return session;
}
