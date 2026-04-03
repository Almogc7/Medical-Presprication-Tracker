import { cookies } from "next/headers";

import { DEFAULT_LOCALE, LOCALE_COOKIE, LOCALES, type Locale } from "@/lib/constants";
import { en } from "@/locales/en";
import { he } from "@/locales/he";

export function isLocale(value: string): value is Locale {
  return (LOCALES as readonly string[]).includes(value);
}

export async function getCurrentLocale(): Promise<Locale> {
  const cookieStore = await cookies();
  const localeCookie = cookieStore.get(LOCALE_COOKIE)?.value;

  if (localeCookie && isLocale(localeCookie)) {
    return localeCookie;
  }

  return DEFAULT_LOCALE;
}

export function getDirection(locale: Locale): "ltr" | "rtl" {
  return locale === "he" ? "rtl" : "ltr";
}

export async function getDictionary() {
  const locale = await getCurrentLocale();

  return {
    locale,
    dir: getDirection(locale),
    t: locale === "he" ? he : en,
  };
}
