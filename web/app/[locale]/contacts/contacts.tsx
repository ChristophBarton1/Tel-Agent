"use client";

import Link from "next/link";
import { useState } from "react";

import { Sidebar } from "@/components/shell/sidebar";
import { StatePreview, type ScreenState } from "@/components/state-preview";
import type { Locale } from "@/lib/locales";

import type { ContactsDictionary } from "./page";

type Key = keyof ContactsDictionary;
type TagName = "customer" | "partner" | "staff" | "blocked";

const TAGS: Record<TagName, { label: Key; color: string; border: string; background: string }> = {
  customer: {
    label: "tag_customer",
    color: "var(--od-muted-2)",
    border: "var(--od-border-9)",
    background: "var(--od-raise-5)",
  },
  partner: {
    label: "tag_partner",
    color: "var(--od-violet-3)",
    border: "var(--od-violet-border)",
    background: "rgba(139,124,255,.12)",
  },
  staff: {
    label: "tag_staff",
    color: "var(--od-green-text)",
    border: "var(--od-green-border)",
    background: "rgba(63,185,132,.11)",
  },
  blocked: {
    label: "tag_blocked",
    color: "var(--od-red-text-4)",
    border: "var(--od-red-border)",
    background: "rgba(240,96,94,.11)",
  },
};

/** A person's name is data; the note about them, and "unknown mobile", are copy. */
const ROWS: {
  name?: string;
  nameKey?: Key;
  note: Key;
  number: string;
  tag: TagName;
  last: Key;
  active?: boolean;
}[] = [
  {
    name: "Anna Gruber",
    note: "row_gruber_note",
    number: "+43 664 1234567",
    tag: "customer",
    last: "when_today_0952",
    active: true,
  },
  {
    name: "Josef Hofer",
    note: "row_hofer_note",
    number: "+43 699 5567 903",
    tag: "customer",
    last: "when_today_0855",
  },
  {
    name: "Klara Wolf",
    note: "row_wolf_note",
    number: "+43 1 512 3390",
    tag: "partner",
    last: "when_yesterday",
  },
  {
    name: "Elisabeth Mayr",
    note: "row_mayr_note",
    number: "+43 1 402 8811",
    tag: "customer",
    last: "when_yesterday",
  },
  {
    name: "Markus Steiner",
    note: "row_steiner_note",
    number: "+43 650 771 4482",
    tag: "customer",
    last: "when_13aug",
  },
  {
    nameKey: "row_unknown_name",
    note: "row_unknown_note",
    number: "+43 720 887 221",
    tag: "blocked",
    last: "when_today_0912",
  },
  {
    name: "Sabine Kaiser",
    note: "row_kaiser_note",
    number: "+43 664 220 1180",
    tag: "staff",
    last: "when_two_days",
  },
];

const DETAIL: { label: Key; value?: string; valueKey?: Key; mono: boolean }[] = [
  { label: "detail_since", value: "12.06.2019", mono: true },
  { label: "detail_account", value: "WP-4471", mono: false },
  { label: "detail_agreement", value: "30.09.2026", mono: true },
  { label: "detail_next", valueKey: "detail_next_value", mono: false },
];

/** What the assistant is allowed to see. Anything off is invisible even if stored. */
const FIELDS: { label: Key; note?: Key; on: boolean }[] = [
  { label: "field_first", note: "field_first_note", on: true },
  { label: "field_last", on: true },
  { label: "field_appointments", note: "field_appointments_note", on: true },
  { label: "field_agreement", note: "field_agreement_note", on: true },
  { label: "field_notes", note: "field_notes_note", on: false },
];

const HISTORY: { what: Key; when: Key; href: string }[] = [
  { what: "history_call_change", when: "when_today_0941", href: "/calls/1" },
  { what: "history_whatsapp", when: "when_today_0952", href: "/conversations" },
  { what: "history_call_hours", when: "when_13aug", href: "/calls/2" },
];

const COLUMNS =
  "minmax(0,1.5fr) minmax(150px,1fr) minmax(120px, max-content) minmax(110px, max-content)";

function Chip({
  label,
  on,
  tone = "plain",
  onClick,
}: {
  label: string;
  on: boolean;
  tone?: "plain" | "violet";
  onClick: () => void;
}) {
  const border = on
    ? tone === "violet"
      ? "var(--od-violet-border)"
      : "var(--od-violet)"
    : "var(--od-border-7)";
  const background = on
    ? tone === "violet"
      ? "rgba(139,124,255,.12)"
      : "var(--od-line-2)"
    : "var(--od-panel-deep-3)";
  const color = on
    ? tone === "violet"
      ? "var(--od-violet-3)"
      : "var(--od-text)"
    : "var(--od-muted-4)";

  return (
    <button
      type="button"
      onClick={onClick}
      className="cursor-pointer rounded-[7px] border p-[7px_12px] text-[13px] whitespace-nowrap"
      style={{ borderColor: border, background, color }}
    >
      {label}
    </button>
  );
}

function Switch({ on }: { on: boolean }) {
  return (
    <span
      className="inline-flex h-[21px] w-[38px] cursor-pointer items-center rounded-full border p-[2px]"
      style={{
        borderColor: on ? "var(--od-violet)" : "var(--od-border-7)",
        background: on ? "var(--od-violet)" : "var(--od-raise)",
        justifyContent: on ? "flex-end" : "flex-start",
      }}
    >
      <span
        className="block size-[15px] rounded-full"
        style={{ background: on ? "#fff" : "var(--od-stroke-5)" }}
      />
    </span>
  );
}

export function Contacts({ locale, t }: { locale: Locale; t: ContactsDictionary }) {
  const [state, setState] = useState<ScreenState>("default");
  const [filter, setFilter] = useState<"all" | "customers" | "blocked">("all");
  const [newOpen, setNewOpen] = useState(false);

  const offline = state === "offline";
  const empty = state === "empty";
  const showList = state === "default" || empty || offline;

  const rows = ROWS.filter((row) =>
    filter === "all" ? true : filter === "customers" ? row.tag === "customer" : row.tag === "blocked",
  );

  const countLine = empty ? t.count_empty : offline ? t.count_offline : t.count;

  return (
    <div className="bg-od-canvas text-od-text-2 min-h-dvh text-[14px] leading-[1.45] ps-[224px]">
      <div className="fixed inset-y-0 start-0 z-50 h-dvh w-[224px]">
        <Sidebar locale={locale} active="contacts" />
      </div>

      <StatePreview state={state} onChange={setState} />

      {offline ? (
        <div className="bg-od-red-bg border-od-red-border flex flex-wrap items-center gap-[14px] border-b px-7 py-[14px]">
          <span
            className="size-[10px] flex-none rounded-full bg-[#F0605E]"
            style={{ animation: "od-ring 1.6s ease-out infinite" }}
          />
          <div className="min-w-[240px] flex-[1_1_340px]">
            <div className="text-[15px] font-semibold text-[color:var(--od-red-text)]">
              {t.offline_title}
            </div>
            <div className="mt-[3px] text-[color:var(--od-red-text-2)]">
              {t.offline_body_before}
              <span className="mono">07:40</span>
              {t.offline_body_after}
            </div>
          </div>
          <button
            type="button"
            className="border-od-red-border-2 bg-od-red-bg-2 hover:bg-od-red-bg-3 cursor-pointer rounded-md border p-[8px_14px] font-medium text-[color:var(--od-red-text-3)]"
          >
            {t.offline_retry}
          </button>
        </div>
      ) : null}

      <div className="mx-auto max-w-[1500px] p-[22px_28px_60px]">
        {state === "error" ? <ImportBroken t={t} /> : null}

        {state === "loading" ? (
          <div className="flex flex-col gap-[10px]">
            {[0, 1, 2, 3, 4, 5, 6, 7].map((index) => (
              <div
                key={index}
                className="border-od-raise-12 h-[56px] rounded-[10px] border"
                style={{
                  background:
                    "linear-gradient(90deg,var(--od-panel),var(--od-raise-7),var(--od-panel))",
                  backgroundSize: "420px 100%",
                  animation: "od-shimmer 1.4s linear infinite",
                }}
              />
            ))}
          </div>
        ) : null}

        {showList ? (
          <div>
            <div className="flex flex-wrap items-end justify-between gap-x-5 gap-y-[14px]">
              <div className="max-w-[64ch]">
                <h1 className="text-od-text m-0 text-[26px] font-semibold tracking-[-0.02em]">
                  {t.title}
                </h1>
                <p className="text-od-muted-4 mt-[6px] text-pretty">{countLine}</p>
              </div>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  className="border-od-border-7 text-od-muted hover:text-od-text-2 cursor-pointer rounded-[7px] border bg-transparent p-[9px_15px] hover:bg-[var(--od-raise-4)]"
                >
                  {t.import_csv}
                </button>
                <button
                  type="button"
                  onClick={() => setNewOpen(true)}
                  className="border-od-stroke bg-od-raise-10 text-od-text-2 hover:bg-od-border-3 cursor-pointer rounded-[7px] border p-[9px_15px] font-medium"
                >
                  {t.new_contact}
                </button>
              </div>
            </div>

            <div className="mt-4 flex flex-wrap items-center gap-[10px]">
              <div className="border-od-border-6 bg-od-panel-deep-3 flex min-w-[240px] flex-[1_1_320px] items-center gap-[10px] rounded-lg border p-[9px_13px]">
                <span className="text-od-faint text-[15px]">⌕</span>
                <input
                  placeholder={t.search_placeholder}
                  className="text-od-text-2 min-w-0 flex-1 border-none bg-transparent text-[14.5px] outline-none"
                />
              </div>
              {(
                [
                  { id: "all", label: t.filter_all },
                  { id: "customers", label: t.filter_customers },
                  { id: "blocked", label: t.filter_blocked },
                ] as const
              ).map((entry) => (
                <button
                  key={entry.id}
                  type="button"
                  onClick={() => setFilter(entry.id)}
                  className={`cursor-pointer rounded-lg border p-[8px_13px] text-[13.5px] whitespace-nowrap ${
                    filter === entry.id
                      ? "border-od-stroke bg-od-line-2 text-od-text"
                      : "border-od-border-7 bg-od-panel-deep-3 text-od-muted-4"
                  }`}
                >
                  {entry.label}
                </button>
              ))}
            </div>

            {empty ? (
              <div className="border-od-border-6 bg-od-panel-deep-2 mt-[18px] rounded-[10px] border border-dashed p-[40px_28px]">
                <h3 className="m-0 text-[18px] font-semibold">{t.empty_title}</h3>
                <p className="text-od-muted mt-[10px] max-w-[60ch] text-pretty">{t.empty_body}</p>
                <div className="mt-4 flex flex-wrap gap-[10px]">
                  <button
                    type="button"
                    onClick={() => setNewOpen(true)}
                    className="border-od-stroke bg-od-raise-10 text-od-text-2 hover:bg-od-border-3 cursor-pointer rounded-md border p-[9px_16px] font-medium"
                  >
                    {t.new_contact}
                  </button>
                  <button
                    type="button"
                    className="border-od-border-2 text-od-muted hover:text-od-text-2 cursor-pointer rounded-md border bg-transparent p-[9px_16px]"
                  >
                    {t.import_csv}
                  </button>
                  <Link
                    href={`/${locale}/settings`}
                    className="border-od-border-2 text-od-muted hover:text-od-text-2 rounded-md border p-[9px_16px] hover:no-underline"
                  >
                    {t.empty_connect}
                  </Link>
                </div>
              </div>
            ) : (
              <div className="mt-[18px] flex flex-wrap items-start gap-5">
                <div className="border-od-line bg-od-panel-deep-3 min-w-[min(100%,440px)] flex-[3_1_480px] overflow-hidden rounded-[10px] border">
                  <div
                    className="border-od-line bg-od-canvas-2 text-od-faint grid gap-4 border-b p-[11px_18px] text-[11px] tracking-[.08em] uppercase"
                    style={{ gridTemplateColumns: COLUMNS }}
                  >
                    <span>{t.column_name}</span>
                    <span>{t.column_number}</span>
                    <span>{t.column_known}</span>
                    <span>{t.column_last}</span>
                  </div>

                  {rows.map((row) => {
                    const tag = TAGS[row.tag];
                    return (
                      <div
                        key={row.number}
                        className="grid cursor-pointer items-center gap-4 border-b border-[color:var(--od-raise-6)] p-[12px_18px]"
                        style={{
                          gridTemplateColumns: COLUMNS,
                          background: row.active ? "var(--od-raise)" : "transparent",
                          borderInlineStart: `2px solid ${row.active ? "var(--od-violet)" : "transparent"}`,
                        }}
                      >
                        <div className="flex min-w-0 items-center gap-[11px]">
                          <span className="border-od-border-9 text-od-text-5 inline-flex size-[30px] flex-none items-center justify-center rounded-full border bg-[var(--od-raise-5)] text-[12.5px] font-semibold">
                            {(row.nameKey ? t[row.nameKey] : (row.name ?? "")).slice(0, 1)}
                          </span>
                          <div className="min-w-0">
                            <div className="text-od-text font-medium text-pretty">
                              {row.nameKey ? t[row.nameKey] : row.name}
                            </div>
                            <div className="text-od-muted-5 mt-[2px] text-[12.5px] text-pretty">
                              {t[row.note]}
                            </div>
                          </div>
                        </div>
                        <span
                          dir="ltr"
                          className="mono ltr-data text-start text-[12.5px] [overflow-wrap:anywhere] text-[color:var(--od-text-5)]"
                        >
                          {row.number}
                        </span>
                        <span
                          className="justify-self-start rounded-[5px] border p-[2px_9px] text-[12px] font-medium whitespace-nowrap"
                          style={{
                            borderColor: tag.border,
                            background: tag.background,
                            color: tag.color,
                          }}
                        >
                          {t[tag.label]}
                        </span>
                        <span className="text-od-muted-5 text-[12.5px]">{t[row.last]}</span>
                      </div>
                    );
                  })}
                </div>

                <div className="flex max-w-[380px] min-w-[min(100%,290px)] flex-[1_1_300px] flex-col gap-[14px]">
                  <div className="border-od-line bg-od-panel-deep-3 rounded-[10px] border p-[18px]">
                    <div className="flex items-center gap-3">
                      <span className="border-od-border-9 text-od-text-3 inline-flex size-[42px] items-center justify-center rounded-full border bg-[var(--od-raise-5)] text-[16px] font-semibold">
                        A
                      </span>
                      <div className="min-w-0">
                        <div className="text-od-text text-[17px] font-semibold">Anna Gruber</div>
                        <div
                          dir="ltr"
                          className="mono ltr-data text-od-muted-2 mt-[2px] text-start text-[12.5px]"
                        >
                          +43 664 1234567
                        </div>
                      </div>
                    </div>

                    <div className="border-od-border mt-[14px] flex flex-col gap-[9px] border-t pt-[14px]">
                      {DETAIL.map((entry) => (
                        <div
                          key={entry.label}
                          className="flex flex-wrap items-baseline justify-between gap-x-[14px] gap-y-2"
                        >
                          <span className="text-od-muted-5 text-[12.5px]">{t[entry.label]}</span>
                          <span
                            dir={entry.mono ? "ltr" : undefined}
                            className={`text-[13.5px] text-[color:var(--od-text-3)] ${entry.mono ? "mono ltr-data" : ""}`}
                          >
                            {entry.valueKey ? t[entry.valueKey] : entry.value}
                          </span>
                        </div>
                      ))}
                    </div>

                    <div className="mt-[14px] flex flex-wrap gap-2">
                      <Link
                        href={`/${locale}/live`}
                        className="border-od-stroke bg-od-raise-10 text-od-text-2 hover:bg-od-border-3 rounded-[7px] border p-[8px_13px] text-[13px] font-medium hover:no-underline"
                      >
                        {t.action_call}
                      </Link>
                      <Link
                        href={`/${locale}/conversations`}
                        className="border-od-border-7 text-od-muted hover:text-od-text-2 rounded-[7px] border p-[8px_13px] text-[13px] hover:bg-[var(--od-raise-4)] hover:no-underline"
                      >
                        {t.action_message}
                      </Link>
                    </div>
                  </div>

                  <div className="border-od-line bg-od-panel-deep-3 rounded-[10px] border p-4">
                    <div className="text-od-muted-4 text-[12px] font-semibold tracking-[.07em] uppercase">
                      {t.fields_heading}
                    </div>
                    <div className="mt-2 flex flex-col">
                      {FIELDS.map((field) => (
                        <div
                          key={field.label}
                          className="border-od-border grid items-center gap-3 border-b py-[10px]"
                          style={{ gridTemplateColumns: "minmax(0,1fr) max-content" }}
                        >
                          <div className="min-w-0">
                            <div className="text-od-text-3 text-[13.5px]">{t[field.label]}</div>
                            {field.note ? (
                              <div className="text-od-faint mt-[2px] text-[12px] text-pretty">
                                {t[field.note]}
                              </div>
                            ) : null}
                          </div>
                          <Switch on={field.on} />
                        </div>
                      ))}
                    </div>
                    <div className="text-od-faint mt-[10px] text-[12.5px] text-pretty">
                      {t.fields_footer}
                    </div>
                  </div>

                  <div className="border-od-line bg-od-panel-deep-3 rounded-[10px] border p-4">
                    <div className="text-od-muted-4 text-[12px] font-semibold tracking-[.07em] uppercase">
                      {t.history_heading}
                    </div>
                    <div className="mt-[10px] flex flex-col gap-[10px]">
                      {HISTORY.map((entry) => (
                        <Link
                          key={entry.what}
                          href={`/${locale}${entry.href}`}
                          className="block text-inherit hover:no-underline"
                        >
                          <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-2">
                            <span className="text-od-text-3 text-[13.5px] text-pretty">
                              {t[entry.what]}
                            </span>
                            <span className="text-od-faint text-[11.5px]">{t[entry.when]}</span>
                          </div>
                        </Link>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        ) : null}
      </div>

      {newOpen ? (
        <NewContactDialog locale={locale} t={t} onClose={() => setNewOpen(false)} />
      ) : null}
    </div>
  );
}

const ALLOWED_FIELDS: { id: string; label: Key }[] = [
  { id: "first", label: "field_first" },
  { id: "last", label: "field_last" },
  { id: "number", label: "form_number" },
  { id: "appointments", label: "field_appointments" },
  { id: "note", label: "form_note" },
];

function NewContactDialog({
  locale,
  t,
  onClose,
}: {
  locale: Locale;
  t: ContactsDictionary;
  onClose: () => void;
}) {
  const [kind, setKind] = useState<TagName>("customer");
  const [consent, setConsent] = useState<"signed" | "online" | "none">("signed");
  const [allowed, setAllowed] = useState<string[]>(["first", "last", "number", "appointments"]);

  return (
    <div
      className="fixed inset-0 z-[70] flex items-start justify-center overflow-auto p-[40px_20px]"
      style={{ background: "var(--od-scrim)" }}
    >
      <div
        className="border-od-border-9 bg-od-panel w-full max-w-[620px] overflow-hidden rounded-[14px] border"
        style={{ boxShadow: "0 26px 70px var(--od-scrim-3)" }}
      >
        <div className="border-od-border flex items-start justify-between gap-4 border-b p-[20px_24px_16px]">
          <div>
            <h2 className="text-od-text m-0 text-[19px] font-semibold">{t.dialog_title}</h2>
            <div className="text-od-muted-4 mt-1 text-[13px]">{t.dialog_subtitle}</div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label={t.close}
            className="border-od-border-2 text-od-muted-4 hover:bg-od-raise hover:text-od-text size-[30px] flex-none cursor-pointer rounded-[7px] border bg-transparent text-[15px] leading-none"
          >
            ×
          </button>
        </div>

        <div className="p-[20px_24px]">
          <div className="flex flex-wrap gap-3">
            <Field label={t.form_name} placeholder="Anna Gruber" />
            <Field label={t.form_number} placeholder="+43 664 1234567" mono />
          </div>

          <div className="mt-4">
            <Field label={t.form_note} placeholder={t.row_gruber_note} full />
            <div className="text-od-faint mt-[6px] text-[12.5px] text-pretty">{t.form_note_hint}</div>
          </div>

          <div className="mt-[18px]">
            <div className="text-od-text-5 mb-[7px] text-[12.5px] font-medium">{t.form_kind}</div>
            <div className="flex flex-wrap gap-[7px]">
              {(["customer", "partner", "staff", "blocked"] as const).map((id) => (
                <Chip
                  key={id}
                  label={t[TAGS[id].label]}
                  on={kind === id}
                  onClick={() => setKind(id)}
                />
              ))}
            </div>
          </div>

          {/* Consent decides whether a campaign may ring this person at all. */}
          <div className="border-od-border-4 bg-od-panel-deep-4 mt-5 rounded-[10px] border p-[15px_16px]">
            <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-[10px]">
              <span className="text-od-text-5 text-[12.5px] font-medium">{t.consent_heading}</span>
              <Link href={`/${locale}/consent`} className="text-od-violet text-[12.5px] hover:underline">
                {t.consent_log}
              </Link>
            </div>
            <div className="mt-[9px] flex flex-wrap gap-[7px]">
              {(
                [
                  ["signed", t.consent_signed],
                  ["online", t.consent_online],
                  ["none", t.consent_none],
                ] as const
              ).map(([id, label]) => (
                <Chip key={id} label={label} on={consent === id} onClick={() => setConsent(id)} />
              ))}
            </div>
            {consent !== "none" ? (
              <input
                placeholder="2026-03-04"
                aria-label={t.consent_date_label}
                dir="ltr"
                className="mono ltr-data border-od-border-6 bg-od-canvas-2 text-od-text-2 mt-[10px] w-full rounded-lg border p-[10px_13px] text-[14px] outline-none"
              />
            ) : null}
            <div className="text-od-muted-5 mt-[9px] text-[12.5px] text-pretty">
              {consent === "none" ? t.consent_note_none : t.consent_note_given}
            </div>
          </div>

          <div className="mt-[18px]">
            <div className="text-od-text-5 mb-2 text-[12.5px] font-medium">
              {t.allowed_heading}
            </div>
            <div className="flex flex-wrap gap-[7px]">
              {ALLOWED_FIELDS.map((entry) => (
                <Chip
                  key={entry.id}
                  label={t[entry.label]}
                  tone="violet"
                  on={allowed.includes(entry.id)}
                  onClick={() =>
                    setAllowed((current) =>
                      current.includes(entry.id)
                        ? current.filter((value) => value !== entry.id)
                        : [...current, entry.id],
                    )
                  }
                />
              ))}
            </div>
            <div className="text-od-faint mt-2 text-[12.5px] text-pretty">{t.allowed_footer}</div>
          </div>
        </div>

        <div className="border-od-border bg-od-panel-deep-2 flex flex-wrap justify-end gap-[10px] border-t p-[16px_24px]">
          <button
            type="button"
            onClick={onClose}
            className="border-od-border-2 text-od-muted hover:text-od-text-2 cursor-pointer rounded-[7px] border bg-transparent p-[9px_15px]"
          >
            {t.cancel}
          </button>
          <button
            type="button"
            onClick={onClose}
            className="border-od-stroke bg-od-raise-10 text-od-text-2 cursor-pointer rounded-[7px] border p-[9px_17px] font-semibold"
          >
            {t.save}
          </button>
        </div>
      </div>
    </div>
  );
}

function Field({
  label,
  placeholder,
  mono = false,
  full = false,
}: {
  label: string;
  placeholder: string;
  mono?: boolean;
  full?: boolean;
}) {
  return (
    <div className={full ? "min-w-0" : "min-w-0 flex-[1_1_200px]"}>
      <label className="text-od-text-5 mb-[6px] block text-[12.5px] font-medium">{label}</label>
      <input
        placeholder={placeholder}
        dir={mono ? "ltr" : undefined}
        className={`border-od-border-6 bg-od-panel-deep-3 text-od-text-2 w-full rounded-lg border p-[10px_13px] outline-none ${
          mono ? "mono ltr-data text-[14px]" : "text-[15px]"
        }`}
      />
    </div>
  );
}

function ImportBroken({ t }: { t: ContactsDictionary }) {
  return (
    <div className="flex justify-center py-[70px]">
      <div className="border-od-border-9 bg-od-panel w-full max-w-[560px] rounded-xl border p-8">
        <div className="border-od-red-border bg-od-red-bg inline-flex items-center gap-2 rounded-md border p-[5px_10px] text-[12px] font-semibold text-[color:var(--od-red-text)]">
          {t.error_label}
        </div>
        <h2 className="mt-[18px] mb-0 text-[21px] font-semibold">{t.error_title}</h2>
        <p className="text-od-muted mt-[10px] max-w-[46ch] text-pretty">{t.error_body}</p>
        <div className="mt-5 flex flex-wrap gap-[10px]">
          <button
            type="button"
            className="border-od-stroke bg-od-raise-10 text-od-text-2 hover:bg-od-border-3 cursor-pointer rounded-md border p-[9px_16px] font-medium"
          >
            {t.error_rollback}
          </button>
          <button
            type="button"
            className="border-od-border-2 text-od-muted hover:text-od-text-2 cursor-pointer rounded-md border bg-transparent p-[9px_16px]"
          >
            {t.error_show}
          </button>
        </div>
      </div>
    </div>
  );
}
