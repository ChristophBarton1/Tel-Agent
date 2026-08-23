"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { Sidebar } from "@/components/shell/sidebar";
import { StatePreview, type ScreenState } from "@/components/state-preview";
import { interpolate } from "@/lib/i18n";
import type { Locale } from "@/lib/locales";

import type { CallsDictionary } from "./page";

type Key = keyof CallsDictionary;
type Handled = "agent" | "human" | "blocked";

const BADGES: Record<Handled, { label: Key; color: string; background: string; border: string }> = {
  agent: {
    label: "handled_agent",
    color: "var(--od-violet-3)",
    background: "rgba(139,124,255,.13)",
    border: "var(--od-violet-border)",
  },
  human: {
    label: "handled_human",
    color: "var(--od-green-text)",
    background: "rgba(63,185,132,.11)",
    border: "var(--od-green-border)",
  },
  blocked: {
    label: "handled_blocked",
    color: "var(--od-red-text-4)",
    background: "rgba(240,96,94,.11)",
    border: "var(--od-red-border)",
  },
};

/** A relative day is a word; a calendar date and a clock time are data. */
type Row = {
  dayKey?: Key;
  day?: string;
  time: string;
  name?: string;
  nameKey?: Key;
  number: string;
  intent: Key;
  handled: Handled;
  length: string;
  flagged?: boolean;
  snippet?: Key;
};

const ROWS: Row[] = [
  {
    dayKey: "day_today",
    time: "09:41",
    name: "Anna Gruber",
    number: "+43 664 1234567",
    intent: "intent_change",
    handled: "agent",
    length: "02:38",
    flagged: true,
    snippet: "snippet_quote",
  },
  {
    dayKey: "day_today",
    time: "09:12",
    nameKey: "caller_unknown",
    number: "+43 720 887 221",
    intent: "intent_spam",
    handled: "blocked",
    length: "00:04",
  },
  {
    dayKey: "day_today",
    time: "08:55",
    name: "Josef Hofer",
    number: "+43 699 5567 903",
    intent: "intent_new",
    handled: "agent",
    length: "01:52",
  },
  {
    dayKey: "day_yesterday",
    time: "17:20",
    name: "Elisabeth Mayr",
    number: "+43 1 402 8811",
    intent: "intent_billing",
    handled: "human",
    length: "04:11",
  },
  {
    dayKey: "day_yesterday",
    time: "15:04",
    name: "Wolf & Co",
    number: "+43 1 512 3390",
    intent: "intent_quote",
    handled: "human",
    length: "03:26",
  },
  {
    dayKey: "day_yesterday",
    time: "11:38",
    name: "Anna Gruber",
    number: "+43 664 1234567",
    intent: "intent_change",
    handled: "agent",
    length: "01:07",
  },
  {
    dayKey: "day_13aug",
    time: "16:47",
    nameKey: "caller_unknown",
    number: "+43 676 220 0043",
    intent: "intent_silent",
    handled: "blocked",
    length: "00:02",
  },
  {
    dayKey: "day_13aug",
    time: "10:02",
    name: "Markus Steiner",
    number: "+43 650 771 4482",
    intent: "intent_cancel",
    handled: "agent",
    length: "00:58",
  },
];

const FILTERS: Key[] = [
  "filter_days",
  "filter_handled",
  "filter_intent",
  "filter_attention",
];

/** Five columns, shared by the header and every row so they cannot drift apart. */
const COLUMNS =
  "minmax(0,1fr) minmax(0,1.6fr) minmax(0,1fr) minmax(112px, max-content) minmax(72px, max-content)";

export function CallsList({ locale, t }: { locale: Locale; t: CallsDictionary }) {
  const router = useRouter();
  const [state, setState] = useState<ScreenState>("default");
  const [query, setQuery] = useState("");

  const offline = state === "offline";
  const empty = state === "empty";
  const showList = state === "default" || empty || offline;

  return (
    <div className="bg-od-canvas text-od-text-2 min-h-dvh text-[14px] leading-[1.45] ps-[224px]">
      <div className="fixed inset-y-0 start-0 z-50 h-dvh w-[224px]">
        <Sidebar locale={locale} active="calls" />
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
              <span className="mono">sip.easybell.de</span>
              {t.offline_body_middle}
              <span className="mono">09:58</span>
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

      <div className="mx-auto max-w-[1400px] p-[26px_28px_80px]">
        {state === "error" ? <IndexRebuilding t={t} /> : null}
        {state === "loading" ? <ListSkeleton /> : null}

        {showList ? (
          <div>
            <div className="flex flex-wrap items-end justify-between gap-x-5 gap-y-[14px]">
              <div>
                <h1 className="text-od-text m-0 text-[26px] font-semibold tracking-[-0.02em]">
                  {t.title}
                </h1>
                <div className="text-od-muted-4 mt-[5px]">
                  {empty ? t.subtitle_empty : t.subtitle}
                </div>
              </div>
              <button
                type="button"
                className="border-od-border-7 text-od-muted hover:text-od-text-2 cursor-pointer rounded-md border bg-transparent p-[8px_14px] hover:bg-[var(--od-raise-4)]"
              >
                {t.export_csv}
              </button>
            </div>

            {/* §A6.3: full-text search is the headline feature, so it gets the width. */}
            <div className="mt-[18px] flex flex-wrap items-center gap-[10px]">
              <div className="border-od-border-6 bg-od-panel-deep-3 flex min-w-[260px] flex-[1_1_380px] items-center gap-[10px] rounded-lg border p-[10px_14px]">
                <span className="text-od-faint text-[15px]">⌕</span>
                <input
                  value={empty ? t.empty_query : query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder={t.search_placeholder}
                  className="text-od-text-2 min-w-0 flex-1 border-none bg-transparent text-[15px] outline-none"
                />
                <span
                  dir="ltr"
                  className="mono ltr-data text-od-faint-2 border-od-border-7 rounded border p-[2px_6px] text-[11px]"
                >
                  ⌘K
                </span>
              </div>
              {FILTERS.map((filter) => (
                <button
                  key={filter}
                  type="button"
                  className="border-od-border-7 bg-od-panel-deep-3 text-od-muted hover:text-od-text-2 hover:border-od-stroke cursor-pointer rounded-lg border p-[9px_13px]"
                >
                  {t[filter]}
                </button>
              ))}
            </div>

            {empty ? (
              <div className="border-od-border-6 bg-od-panel-deep-2 mt-5 rounded-[10px] border border-dashed p-[46px_30px] text-center">
                <h3 className="m-0 text-[19px] font-semibold">
                  {interpolate(t.empty_title, { query: t.empty_query })}
                </h3>
                <p className="text-od-muted mx-auto mt-[10px] max-w-[52ch] text-pretty">
                  {t.empty_body}
                </p>
                <div className="mt-[18px] flex flex-wrap justify-center gap-[10px]">
                  <button
                    type="button"
                    className="border-od-stroke bg-od-raise-10 text-od-text-2 hover:bg-od-border-3 cursor-pointer rounded-md border p-[9px_16px] font-medium"
                  >
                    {t.empty_all_time}
                  </button>
                  <button
                    type="button"
                    className="border-od-border-2 text-od-muted hover:text-od-text-2 cursor-pointer rounded-md border bg-transparent p-[9px_16px]"
                  >
                    {t.empty_clear}
                  </button>
                </div>
              </div>
            ) : (
              <div className="border-od-line bg-od-panel-deep-3 mt-5 overflow-x-auto overflow-y-hidden rounded-[10px] border">
                <div
                  className="border-od-line bg-od-canvas-2 text-od-faint grid gap-[18px] border-b p-[11px_18px] text-[11px] tracking-[.08em] uppercase"
                  style={{ gridTemplateColumns: COLUMNS }}
                >
                  <span>{t.column_when}</span>
                  <span>{t.column_caller}</span>
                  <span>{t.column_intent}</span>
                  <span>{t.column_handled}</span>
                  <span>{t.column_length}</span>
                </div>

                {ROWS.map((row, index) => {
                  const badge = BADGES[row.handled];
                  return (
                    <div
                      key={`${row.day ?? row.dayKey}-${row.time}`}
                      onClick={() => router.push(`/${locale}/calls/1`)}
                      className="hover:bg-od-raise grid cursor-pointer items-start gap-[18px] border-b border-[color:var(--od-raise-6)] p-[14px_18px]"
                      style={{ gridTemplateColumns: COLUMNS }}
                    >
                      <div>
                        <div className="text-od-text-3">
                          {row.dayKey ? t[row.dayKey] : row.day}
                        </div>
                        <div dir="ltr" className="mono ltr-data text-od-faint mt-[2px] text-[12.5px]">
                          {row.time}
                        </div>
                      </div>
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="text-od-text font-medium">
                            {row.nameKey ? t[row.nameKey] : row.name}
                          </span>
                          {row.flagged ? (
                            <span className="border-od-amber-border bg-od-amber-bg rounded border p-[1px_7px] text-[11px] font-semibold text-[color:var(--od-amber-text)]">
                              {t.flag_attention}
                            </span>
                          ) : null}
                        </div>
                        <div
                          dir="ltr"
                          className="mono ltr-data text-od-muted-5 mt-[3px] text-[12.5px]"
                        >
                          {row.number}
                        </div>
                        {index === 0 && row.snippet ? (
                          <div className="border-od-border-9 bg-od-raise text-od-muted mt-[7px] rounded-e-md border-s-2 p-[7px_10px] text-[13px] text-pretty">
                            {t[row.snippet]}
                          </div>
                        ) : null}
                      </div>
                      <div className="text-pretty text-[color:var(--od-text-5)]">
                        {t[row.intent]}
                      </div>
                      <div>
                        <span
                          className="inline-flex items-center gap-[7px] rounded-md border p-[3px_10px] text-[12.5px] font-medium whitespace-nowrap"
                          style={{
                            borderColor: badge.border,
                            background: badge.background,
                            color: badge.color,
                          }}
                        >
                          {t[badge.label]}
                        </span>
                      </div>
                      <div dir="ltr" className="mono ltr-data text-od-muted">
                        {row.length}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        ) : null}
      </div>
    </div>
  );
}

function IndexRebuilding({ t }: { t: CallsDictionary }) {
  return (
    <div className="flex justify-center py-20">
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
            {t.error_check}
          </button>
          <button
            type="button"
            className="border-od-border-2 text-od-muted hover:text-od-text-2 cursor-pointer rounded-md border bg-transparent p-[9px_16px]"
          >
            {t.error_diagnostics}
          </button>
        </div>
        <div
          dir="ltr"
          className="border-od-border mono ltr-data text-od-faint mt-[18px] flex flex-wrap gap-4 border-t pt-[14px] text-[11.5px]"
        >
          <span>index/rebuilding</span>
          <span>68% complete</span>
          <span>2026-08-16 11:04:22</span>
        </div>
      </div>
    </div>
  );
}

function ListSkeleton() {
  const shimmer = (from: string, to: string) => ({
    background: `linear-gradient(90deg,var(${from}),var(${to}),var(${from}))`,
    backgroundSize: "420px 100%",
    animation: "od-shimmer 1.4s linear infinite",
  });

  return (
    <div>
      <div className="h-[30px] w-40 rounded-md" style={shimmer("--od-raise-4", "--od-raise-13")} />
      <div
        className="border-od-raise-12 mt-5 h-11 rounded-lg border"
        style={shimmer("--od-panel", "--od-raise-7")}
      />
      <div className="border-od-line bg-od-panel-deep-3 mt-5 overflow-x-auto overflow-y-hidden rounded-[10px] border">
        {[72, 88, 64, 92, 78, 70, 86, 60].map((width, index) => (
          <div
            key={index}
            className="grid gap-[18px] border-b border-[color:var(--od-raise-6)] p-[16px_18px]"
            style={{ gridTemplateColumns: "150px minmax(0,1.6fr) 1fr 130px 90px" }}
          >
            <div className="h-3 rounded bg-[var(--od-raise-4)]" />
            <div
              className="h-3 rounded"
              style={{ width: `${width}%`, ...shimmer("--od-raise-2", "--od-raise-11") }}
            />
            <div className="h-3 rounded bg-[var(--od-raise-4)]" />
            <div className="h-5 rounded-[5px] bg-[var(--od-raise-8)]" />
            <div className="h-3 rounded bg-[var(--od-raise-4)]" />
          </div>
        ))}
      </div>
    </div>
  );
}
