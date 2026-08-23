import { notFound } from "next/navigation";

import ar from "../../../../locales/ar/settings.json";
import de from "../../../../locales/de/settings.json";
import en from "../../../../locales/en/settings.json";

import { pickDictionary } from "@/lib/i18n";
import { isLocale } from "@/lib/locales";

import { Settings } from "./settings";

/** English is the reference shape; the other two are checked against it. */
export type SettingsDictionary = typeof en;

export default async function SettingsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();

  const t = pickDictionary<SettingsDictionary>(locale, { en, de, ar });

  return <Settings locale={locale} t={t} />;
}
