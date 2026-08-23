import { notFound } from "next/navigation";

import ar from "../../../../../locales/ar/editor.json";
import de from "../../../../../locales/de/editor.json";
import en from "../../../../../locales/en/editor.json";

import { pickDictionary } from "@/lib/i18n";
import { isLocale } from "@/lib/locales";

import { AssistantEditor } from "./editor";

/** English is the reference shape; the other two are checked against it. */
export type EditorDictionary = typeof en;

export default async function AssistantEditorPage({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();

  const t = pickDictionary<EditorDictionary>(locale, { en, de, ar });

  return <AssistantEditor locale={locale} t={t} />;
}
