import { notFound } from "next/navigation";

import ar from "../../../../locales/ar/update.json";
import de from "../../../../locales/de/update.json";
import en from "../../../../locales/en/update.json";

import { pickDictionary } from "@/lib/i18n";
import { isLocale } from "@/lib/locales";

import { Update } from "./update";

/** English is the reference shape; the other two are checked against it. */
export type UpdateDictionary = typeof en;

export default async function UpdatePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();

  const t = pickDictionary<UpdateDictionary>(locale, { en, de, ar });

  return <Update locale={locale} t={t} />;
}
