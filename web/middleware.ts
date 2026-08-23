import { NextResponse, type NextRequest } from "next/server";

import { DEFAULT_LOCALE, LOCALES } from "@/lib/locales";

/**
 * Every page lives under a locale segment. A request without one is redirected to
 * the language the browser asks for, falling back to English.
 */
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const hasLocale = LOCALES.some(
    (locale) => pathname === `/${locale}` || pathname.startsWith(`/${locale}/`),
  );
  if (hasLocale) return NextResponse.next();

  const url = request.nextUrl.clone();
  url.pathname = `/${preferredLocale(request)}${pathname === "/" ? "" : pathname}`;
  return NextResponse.redirect(url);
}

function preferredLocale(request: NextRequest): string {
  const header = request.headers.get("accept-language") ?? "";
  for (const part of header.split(",")) {
    const tag = part.split(";")[0].trim().toLowerCase();
    const match = LOCALES.find((locale) => tag === locale || tag.startsWith(`${locale}-`));
    if (match) return match;
  }
  return DEFAULT_LOCALE;
}

export const config = {
  matcher: ["/((?!_next|favicon.ico|.*\..*).*)"],
};
