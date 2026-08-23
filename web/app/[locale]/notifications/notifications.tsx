"use client";

import Link from "next/link";
import { useState } from "react";

import { Sidebar } from "@/components/shell/sidebar";
import { StatePreview, type ScreenState } from "@/components/state-preview";
import { interpolate } from "@/lib/i18n";
import type { Locale } from "@/lib/locales";

import type { NotificationsDictionary } from "./page";

type Key = keyof NotificationsDictionary;
type Kind = "failures" | "review" | "missed" | "system";

type OpenItem = {
  id: string;
  severity: "red" | "amber";
  kind: Kind;
  tag: Key;
  time: string;
  title: Key;
  body: Key;
  primary: Key;
  secondary: Key;
};

/** Waiting on a decision only a person can make. */
const OPEN: OpenItem[] = [
  {
    id: "sms",
    severity: "red",
    kind: "failures",
    tag: "tag_tool_failed",
    time: "09:44",
    title: "open_sms_title",
    body: "open_sms_body",
    primary: "open_sms_primary",
    secondary: "open_sms_secondary",
  },
  {
    id: "blocked",
    severity: "amber",
    kind: "review",
    tag: "tag_review",
    time: "09:12",
    title: "open_blocked_title",
    body: "open_blocked_body",
    primary: "open_blocked_primary",
    secondary: "open_blocked_secondary",
  },
  {
    id: "disabled",
    severity: "amber",
    kind: "missed",
    tag: "tag_missed",
    time: "08:30",
    title: "open_disabled_title",
    body: "open_disabled_body",
    primary: "open_disabled_primary",
    secondary: "open_disabled_secondary",
  },
];

/**
 * A record of what happened while nobody was watching. A clock time is data; a
 * relative day is a word, so it carries a key instead.
 */
const LOG: {
  id: string;
  ok: boolean;
  kind: Kind;
  title: Key;
  body: Key;
  time?: string;
  timeKey?: Key;
}[] = [
  { id: "webhook", ok: true, kind: "failures", title: "log_webhook_title", body: "log_webhook_body", time: "09:20" },
  { id: "sip", ok: true, kind: "system", title: "log_sip_title", body: "log_sip_body", time: "08:12" },
  { id: "allowed", ok: true, kind: "review", title: "log_allowed_title", body: "log_allowed_body", timeKey: "when_yesterday" },
  { id: "calendar", ok: false, kind: "failures", title: "log_calendar_title", body: "log_calendar_body", timeKey: "when_yesterday" },
  { id: "summary", ok: true, kind: "system", title: "log_summary_title", body: "log_summary_body", timeKey: "when_yesterday" },
  { id: "backup", ok: true, kind: "system", title: "log_backup_title", body: "log_backup_body", timeKey: "when_two_days" },
  { id: "missed", ok: true, kind: "missed", title: "log_missed_title", body: "log_missed_body", timeKey: "when_two_days" },
];

const FILTERS: { id: "all" | Kind; label: Key }[] = [
  { id: "all", label: "filter_all" },
  { id: "failures", label: "filter_failures" },
  { id: "review", label: "filter_review" },
  { id: "missed", label: "filter_missed" },
  { id: "system", label: "filter_system" },
];

const SEVERITY = {
  red: {
    border: "var(--od-red-border-3)",
    background: "var(--od-red-bg-4)",
    dot: "#F0605E",
    tagColor: "var(--od-red-text-5)",
    tagBorder: "var(--od-red-border-3)",
    tagBackground: "var(--od-red-bg-5)",
    title: "var(--od-red-text-3)",
    body: "var(--od-red-text-6)",
    primaryBorder: "var(--od-red-border-2)",
    primaryBackground: "var(--od-red-bg-2)",
    primaryColor: "var(--od-red-text-3)",
    secondaryBorder: "var(--od-red-border-4)",
    secondaryColor: "var(--od-red-text-2)",
  },
  amber: {
    border: "var(--od-amber-border-2)",
    background: "var(--od-amber-bg-2)",
    dot: "var(--od-amber)",
    tagColor: "var(--od-amber-text)",
    tagBorder: "var(--od-amber-border)",
    tagBackground: "var(--od-amber-bg)",
    title: "var(--od-amber-text-2)",
    body: "var(--od-amber-text-3)",
    primaryBorder: "var(--od-amber-border)",
    primaryBackground: "var(--od-amber-bg)",
    primaryColor: "var(--od-amber-text-2)",
    secondaryBorder: "var(--od-amber-bg-4)",
    secondaryColor: "var(--od-amber-text-3)",
  },
} as const;

export function Notifications({
  locale,
  t,
}: {
  locale: Locale;
  t: NotificationsDictionary;
}) {
  const [state, setState] = useState<ScreenState>("default");
  const [filter, setFilter] = useState<"all" | Kind>("all");

  const empty = state === "empty";
  const matches = (kind: Kind) => filter === "all" || kind === filter;
  const openItems = empty ? [] : OPEN.filter((item) => matches(item.kind));
  const logItems = empty ? [] : LOG.filter((item) => matches(item.kind));

  return (
    <div className="bg-od-canvas text-od-text-2 min-h-dvh text-[14px] leading-[1.45] ps-[224px]">
      <div className="fixed inset-y-0 start-0 z-50 h-dvh w-[224px]">
        <Sidebar locale={locale} active="notifications" />
      </div>

      <StatePreview state={state} onChange={setState} states={["default", "empty", "loading"]} />

      <div className="mx-auto max-w-[1000px] p-[26px_28px_80px]">
        <div className="flex flex-wrap items-start justify-between gap-x-5 gap-y-[14px]">
          <div className="min-w-0 max-w-[64ch] flex-[1_1_320px]">
            <h1 className="text-od-text m-0 text-[26px] font-semibold tracking-[-0.02em]">
              {t.title}
            </h1>
            <p className="text-od-muted-4 mt-[6px] text-pretty">{t.intro}</p>
          </div>
          <button
            type="button"
            className="border-od-border-2 text-od-muted hover:text-od-text-2 flex-none cursor-pointer rounded-[7px] border bg-transparent p-[9px_15px] text-[13px] whitespace-nowrap hover:bg-[var(--od-raise-4)]"
          >
            {t.mark_all_read}
          </button>
        </div>

        <div className="mt-5 flex flex-wrap gap-2">
          {FILTERS.map((entry) => {
            const on = filter === entry.id;
            const count =
              entry.id === "all"
                ? OPEN.length + LOG.length
                : OPEN.filter((item) => item.kind === entry.id).length +
                  LOG.filter((item) => item.kind === entry.id).length;
            return (
              <button
                key={entry.id}
                type="button"
                onClick={() => setFilter(entry.id)}
                className={`inline-flex cursor-pointer items-center gap-2 rounded-full border p-[7px_13px] text-[13px] whitespace-nowrap ${
                  on
                    ? "border-od-stroke bg-od-raise-10 text-od-text"
                    : "border-od-border-7 text-od-muted-4 bg-transparent"
                }`}
              >
                <span>{t[entry.label]}</span>
                <span
                  dir="ltr"
                  className="mono ltr-data text-[11.5px]"
                  style={{ color: on ? "var(--od-muted-4)" : "var(--od-faint-2)" }}
                >
                  {empty ? 0 : count}
                </span>
              </button>
            );
          })}
        </div>

        {state === "loading" ? (
          <div className="mt-[18px] flex flex-col gap-[10px]">
            {[0, 1, 2, 3, 4].map((index) => (
              <div
                key={index}
                className="border-od-raise-12 h-[86px] rounded-[10px] border"
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

        {empty ? (
          <div className="border-od-border-6 bg-od-panel-deep-2 mt-5 rounded-[10px] border border-dashed p-[34px_28px]">
            <h3 className="m-0 text-[18px] font-semibold">{t.empty_title}</h3>
            <p className="text-od-muted mt-[9px] max-w-[58ch] text-pretty">{t.empty_body}</p>
          </div>
        ) : null}

        {openItems.length > 0 ? (
          <section className="mt-[22px]">
            <div className="flex flex-wrap items-baseline justify-between gap-x-[14px] gap-y-2">
              <h2 className="text-od-muted-4 m-0 text-[13px] font-semibold tracking-[.07em] uppercase">
                {t.open_heading}
              </h2>
              <span className="text-od-faint text-[12.5px]">
                {openItems.length === 1
                  ? t.items_one
                  : interpolate(t.items_many, { count: openItems.length })}
              </span>
            </div>
            <div className="mt-3 flex flex-col gap-[10px]">
              {openItems.map((item) => {
                const tone = SEVERITY[item.severity];
                return (
                  <div
                    key={item.id}
                    className="rounded-[10px] border p-[13px_16px]"
                    style={{ borderColor: tone.border, background: tone.background }}
                  >
                    <div className="flex flex-wrap items-start gap-x-[18px] gap-y-3">
                      <span
                        className="mt-[6px] size-[9px] flex-none rounded-full"
                        style={{ background: tone.dot }}
                      />
                      <div className="min-w-[240px] flex-[1_1_320px]">
                        <div className="flex flex-wrap items-center gap-[10px]">
                          <span
                            className="rounded-[5px] border p-[2px_8px] text-[11.5px] font-bold tracking-[.05em] uppercase whitespace-nowrap"
                            style={{
                              borderColor: tone.tagBorder,
                              background: tone.tagBackground,
                              color: tone.tagColor,
                            }}
                          >
                            {t[item.tag]}
                          </span>
                          <span dir="ltr" className="mono ltr-data text-od-faint text-[12px]">
                            {item.time}
                          </span>
                        </div>
                        <div
                          className="mt-[6px] text-[15px] font-semibold text-pretty"
                          style={{ color: tone.title }}
                        >
                          {t[item.title]}
                        </div>
                        <div
                          className="mt-[3px] max-w-[64ch] text-[13px] text-pretty"
                          style={{ color: tone.body }}
                        >
                          {t[item.body]}
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <button
                          type="button"
                          className="cursor-pointer rounded-md border p-[8px_14px] text-[13px] font-medium whitespace-nowrap"
                          style={{
                            borderColor: tone.primaryBorder,
                            background: tone.primaryBackground,
                            color: tone.primaryColor,
                          }}
                        >
                          {t[item.primary]}
                        </button>
                        <button
                          type="button"
                          className="cursor-pointer rounded-md border bg-transparent p-[8px_14px] text-[13px] font-medium whitespace-nowrap"
                          style={{ borderColor: tone.secondaryBorder, color: tone.secondaryColor }}
                        >
                          {t[item.secondary]}
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        ) : null}

        {logItems.length > 0 ? (
          <section className="mt-[26px]">
            <h2 className="text-od-muted-4 mt-0 mb-3 text-[13px] font-semibold tracking-[.07em] uppercase">
              {t.log_heading}
            </h2>
            <div className="border-od-line bg-od-panel-deep-3 overflow-hidden rounded-[10px] border">
              {logItems.map((item, index) => (
                <div
                  key={item.id}
                  className={`hover:bg-od-raise flex cursor-pointer flex-wrap items-start gap-x-[14px] gap-y-[10px] p-[13px_16px] ${
                    index === 0 ? "" : "border-t border-[color:var(--od-raise-6)]"
                  }`}
                >
                  <span
                    className="inline-flex size-[21px] flex-none items-center justify-center rounded-full border text-[11.5px] leading-none font-bold"
                    style={{
                      borderColor: item.ok ? "var(--od-green-border)" : "var(--od-amber-border)",
                      background: item.ok ? "rgba(63,185,132,.11)" : "var(--od-amber-bg)",
                      color: item.ok ? "var(--od-green-text)" : "var(--od-amber-text)",
                    }}
                  >
                    {item.ok ? "✓" : "!"}
                  </span>
                  <div className="min-w-[240px] flex-[1_1_300px]">
                    <div className="text-od-text-3 text-pretty">{t[item.title]}</div>
                    <div className="text-od-muted-5 mt-[3px] text-[12.5px] text-pretty">
                      {t[item.body]}
                    </div>
                  </div>
                  {item.timeKey ? (
                    <span className="text-od-faint-2 flex-none text-[12px] whitespace-nowrap">
                      {t[item.timeKey]}
                    </span>
                  ) : (
                    <span
                      dir="ltr"
                      className="mono ltr-data text-od-faint-2 flex-none text-[12px] whitespace-nowrap"
                    >
                      {item.time}
                    </span>
                  )}
                </div>
              ))}
            </div>

            <div className="border-od-line bg-od-panel-deep-2 mt-[14px] flex flex-wrap items-center justify-between gap-x-[18px] gap-y-[10px] rounded-[9px] border p-[13px_15px]">
              <span className="text-od-muted max-w-[62ch] text-[12.5px] text-pretty">
                {t.retention_note}
              </span>
              <Link
                href={`/${locale}/settings`}
                className="text-od-violet text-[13px] whitespace-nowrap hover:underline"
              >
                {t.email_settings}
              </Link>
            </div>
          </section>
        ) : null}
      </div>
    </div>
  );
}
