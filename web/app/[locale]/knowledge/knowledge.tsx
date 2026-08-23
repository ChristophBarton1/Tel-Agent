"use client";

import { useState } from "react";

import { Sidebar } from "@/components/shell/sidebar";
import { StatePreview, type ScreenState } from "@/components/state-preview";
import { interpolate } from "@/lib/i18n";
import type { Locale } from "@/lib/locales";

import type { KnowledgeDictionary } from "./page";

type Key = keyof KnowledgeDictionary;

/** Opening hours are data, not a document - booking and routing both read them. */
const HOURS: { day: Key; slots: string[] }[] = [
  { day: "day_monday", slots: ["08:00 – 12:00", "14:00 – 17:00"] },
  { day: "day_tuesday", slots: ["08:00 – 12:00", "14:00 – 17:00"] },
  { day: "day_wednesday", slots: ["08:00 – 12:00"] },
  { day: "day_thursday", slots: ["08:00 – 12:00", "14:00 – 18:00"] },
  { day: "day_friday", slots: ["08:00 – 13:00"] },
  { day: "day_saturday", slots: [] },
  { day: "day_sunday", slots: [] },
];

const CLOSURES: { label: Key; when: Key }[] = [
  { label: "closure_summer", when: "closure_summer_when" },
  { label: "closure_conference", when: "closure_conference_when" },
  { label: "closure_christmas", when: "closure_christmas_when" },
];

type SourceState = "ok" | "warn" | "bad";

/**
 * A file format marker and a hostname are data; the title of a document the owner
 * wrote, and everything describing it, is copy.
 */
const SOURCES: {
  id: string;
  mark: string;
  name?: string;
  nameKey?: Key;
  meta: Key;
  detail: Key;
  used: number;
  status: Key;
  state: SourceState;
  who: string[];
}[] = [
  {
    id: "hours",
    mark: "PDF",
    nameKey: "source_hours",
    meta: "source_hours_meta",
    detail: "source_hours_detail",
    used: 61,
    status: "status_indexed",
    state: "ok",
    who: ["Lena", "Anna", "Mark"],
  },
  {
    id: "site",
    mark: "WWW",
    name: "wagner-partner.at",
    meta: "source_site_meta",
    detail: "source_site_detail",
    used: 24,
    status: "status_indexed",
    state: "ok",
    who: ["Lena", "Mark"],
  },
  {
    id: "terms",
    mark: "MD",
    nameKey: "source_terms",
    meta: "source_terms_meta",
    detail: "source_terms_detail",
    used: 18,
    status: "status_reindexing",
    state: "warn",
    who: ["Lena"],
  },
  {
    id: "faq",
    mark: "Q&A",
    nameKey: "source_faq",
    meta: "source_faq_meta",
    detail: "source_faq_detail",
    used: 96,
    status: "status_indexed",
    state: "ok",
    who: ["Lena", "Anna", "Mark"],
  },
  {
    id: "parking",
    mark: "TXT",
    nameKey: "source_parking",
    meta: "source_parking_meta",
    detail: "source_parking_detail",
    used: 9,
    status: "status_indexed",
    state: "ok",
    who: ["Lena", "Anna"],
  },
  {
    id: "oldprices",
    mark: "DOC",
    nameKey: "source_oldprices",
    meta: "source_oldprices_meta",
    detail: "source_oldprices_detail",
    used: 2,
    status: "status_conflicts",
    state: "bad",
    who: ["Anna"],
  },
];

/** Assistant names are proper names; "all assistants" is a choice we offer. */
const ASSISTANT_NAMES = ["Lena", "Anna", "Mark"];

const GAPS: { q: Key; count: number }[] = [
  { q: "gap_visits", count: 7 },
  { q: "gap_card", count: 5 },
  { q: "gap_access", count: 3 },
];

const ADD_TABS: { id: string; label: Key }[] = [
  { id: "text", label: "tab_text" },
  { id: "qa", label: "tab_qa" },
  { id: "file", label: "tab_file" },
  { id: "web", label: "tab_web" },
  { id: "folder", label: "tab_folder" },
];

const CRAWL_RATES: { id: string; label: Key }[] = [
  { id: "nightly", label: "rate_nightly" },
  { id: "weekly", label: "rate_weekly" },
  { id: "once", label: "rate_once" },
];

const STATE_TONE: Record<SourceState, { border: string; background: string; color: string }> = {
  ok: { border: "var(--od-green-border)", background: "rgba(63,185,132,.10)", color: "var(--od-green-text)" },
  warn: { border: "var(--od-amber-border)", background: "var(--od-amber-bg)", color: "var(--od-amber-text)" },
  bad: { border: "var(--od-red-border-3)", background: "rgba(240,96,94,.10)", color: "var(--od-red-text-4)" },
};

function Switch({ on }: { on: boolean }) {
  return (
    <span
      className="ms-auto inline-flex h-[21px] w-[38px] flex-none cursor-pointer items-center rounded-full border p-[2px]"
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

export function Knowledge({ locale, t }: { locale: Locale; t: KnowledgeDictionary }) {
  const [state, setState] = useState<ScreenState>("default");
  const [who, setWho] = useState<string | null>(null);
  const [addOpen, setAddOpen] = useState(false);
  const [addTab, setAddTab] = useState("text");

  const offline = state === "offline";
  const empty = state === "empty";
  const showBody = state === "default" || empty || offline;

  const sources = SOURCES.filter((source) => who === null || source.who.includes(who));

  return (
    <div className="bg-od-canvas text-od-text-2 min-h-dvh text-[14px] leading-[1.45] ps-[224px]">
      <div className="fixed inset-y-0 start-0 z-50 h-dvh w-[224px]">
        <Sidebar locale={locale} active="assistants" />
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
              <span className="mono">08:05</span>
              {t.offline_body_after}
            </div>
          </div>
          <button
            type="button"
            className="border-od-red-border-2 bg-od-red-bg-2 hover:bg-od-red-bg-3 cursor-pointer rounded-md border p-[8px_14px] font-medium text-[color:var(--od-red-text-3)]"
          >
            {t.offline_restart}
          </button>
        </div>
      ) : null}

      <div className="mx-auto max-w-[1400px] p-[22px_28px_60px]">
        {state === "error" ? <CorruptIndex t={t} /> : null}

        {state === "loading" ? (
          <div className="flex flex-col gap-3">
            {[0, 1, 2, 3, 4].map((index) => (
              <div
                key={index}
                className="border-od-raise-12 h-[104px] rounded-[10px] border"
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

        {showBody ? (
          <div>
            <div className="flex flex-wrap items-end justify-between gap-x-5 gap-y-[14px]">
              <div className="max-w-[64ch]">
                <h1 className="text-od-text m-0 text-[26px] font-semibold tracking-[-0.02em]">
                  {t.title}
                </h1>
                <p className="text-od-muted-4 mt-[6px] text-pretty">{t.intro}</p>
              </div>
              <button
                type="button"
                onClick={() => setAddOpen(true)}
                className="border-od-stroke bg-od-raise-10 text-od-text-2 hover:bg-od-border-3 cursor-pointer rounded-[7px] border p-[9px_15px] font-medium"
              >
                {t.add_source}
              </button>
            </div>

            <div className="mt-4 flex flex-wrap items-center gap-[10px]">
              <span className="text-od-faint text-[12.5px]">{t.reading_for}</span>
              {[null, ...ASSISTANT_NAMES].map((name) => (
                <button
                  key={name ?? "all"}
                  type="button"
                  onClick={() => setWho(name)}
                  className={`cursor-pointer rounded-full border p-[6px_12px] text-[13px] whitespace-nowrap ${
                    who === name
                      ? "border-od-stroke bg-od-line-2 text-od-text"
                      : "border-od-border-7 bg-od-panel-deep-3 text-od-muted-4"
                  }`}
                >
                  {name ?? t.all_assistants}
                </button>
              ))}
              <span className="text-od-faint text-[12.5px] text-pretty">
                {who === null
                  ? t.shared_note
                  : interpolate(t.filtered_note, { count: sources.length, who })}
              </span>
            </div>

            <div className="mt-[18px] flex flex-wrap items-start gap-5">
              <div className="flex min-w-[min(100%,420px)] flex-[3_1_460px] flex-col gap-3">
                <div className="border-od-line bg-od-panel-deep-3 overflow-hidden rounded-[10px] border">
                  <div className="border-od-line bg-od-canvas-2 flex flex-wrap items-start justify-between gap-x-[18px] gap-y-[10px] border-b p-[16px_18px]">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-[9px]">
                        <span className="text-od-text text-[15.5px] font-semibold">
                          {t.hours_title}
                        </span>
                        <span className="border-od-border-7 text-od-muted-5 rounded-[5px] border bg-[var(--od-raise-5)] p-[2px_9px] text-[11px] font-semibold whitespace-nowrap">
                          {t.hours_structured}
                        </span>
                      </div>
                      <div className="text-od-muted-5 mt-1 max-w-[70ch] text-[12.5px] text-pretty">
                        {t.hours_note}
                      </div>
                    </div>
                    <span className="text-od-faint text-[12.5px] whitespace-nowrap">
                      {t.timezone}
                    </span>
                  </div>

                  {HOURS.map(({ day, slots }) => {
                    const open = slots.length > 0;
                    return (
                      <div
                        key={day}
                        className="flex flex-wrap items-center gap-x-4 gap-y-[10px] border-b border-[color:var(--od-raise-6)] p-[11px_18px]"
                      >
                        <span
                          className="w-24 flex-none text-[13.5px]"
                          style={{
                            fontWeight: open ? 500 : 400,
                            color: open ? "var(--od-text-3)" : "var(--od-faint)",
                          }}
                        >
                          {t[day]}
                        </span>

                        {open ? (
                          <div className="flex flex-wrap items-center gap-2">
                            {slots.map((slot) => (
                              <span
                                key={slot}
                                dir="ltr"
                                className="mono ltr-data border-od-border-6 bg-od-canvas-2 text-od-text-2 rounded-[7px] border p-[5px_11px] text-[12.5px] whitespace-nowrap"
                              >
                                {slot}
                              </span>
                            ))}
                            <button
                              type="button"
                              className="border-od-stroke-3 text-od-muted-5 hover:text-od-text-2 hover:border-od-faint-3 cursor-pointer rounded-full border border-dashed bg-transparent p-[4px_9px] text-[12px] whitespace-nowrap"
                            >
                              {t.add_slot}
                            </button>
                          </div>
                        ) : (
                          <span className="text-od-faint text-[13px]">{t.closed_note}</span>
                        )}

                        <Switch on={open} />
                      </div>
                    );
                  })}

                  <div className="p-[14px_18px]">
                    <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-[10px]">
                      <span className="text-od-faint text-[12px] font-semibold tracking-[.08em] uppercase">
                        {t.closures}
                      </span>
                      <button
                        type="button"
                        className="text-od-muted-4 hover:text-od-text-2 cursor-pointer border-none bg-transparent p-0 text-[13px]"
                      >
                        {t.add_closure}
                      </button>
                    </div>
                    <div className="mt-[10px] flex flex-wrap gap-2">
                      {CLOSURES.map((closure) => (
                        <span
                          key={closure.label}
                          className="border-od-border-7 text-od-muted-2 inline-flex items-center gap-2 rounded-full border bg-[var(--od-raise-5)] p-[5px_11px] text-[12.5px] whitespace-nowrap"
                        >
                          <span>{t[closure.label]}</span>
                          <span className="text-od-faint-2 text-[11.5px]">{t[closure.when]}</span>
                        </span>
                      ))}
                    </div>
                    <div className="text-od-faint mt-3 max-w-[74ch] text-[12.5px] text-pretty">
                      {t.closures_note}
                    </div>
                  </div>
                </div>

                {empty ? (
                  <div className="border-od-border-6 bg-od-panel-deep-2 rounded-[10px] border border-dashed p-[40px_28px]">
                    <h3 className="m-0 text-[18px] font-semibold">{t.empty_title}</h3>
                    <p className="text-od-muted mt-[10px] max-w-[60ch] text-pretty">{t.empty_body}</p>
                    <button
                      type="button"
                      onClick={() => setAddOpen(true)}
                      className="border-od-stroke bg-od-raise-10 text-od-text-2 hover:bg-od-border-3 mt-4 cursor-pointer rounded-md border p-[9px_16px] font-medium"
                    >
                      {t.empty_action}
                    </button>
                  </div>
                ) : (
                  <div className="flex flex-col gap-[10px]">
                    {sources.map((source) => {
                      const tone = STATE_TONE[source.state];
                      return (
                        <div
                          key={source.id}
                          className="rounded-[10px] border p-4"
                          style={{
                            borderColor:
                              source.state === "bad" ? "var(--od-red-border-3)" : "var(--od-line)",
                            background:
                              source.state === "bad"
                                ? "var(--od-red-bg-4)"
                                : "var(--od-panel-deep-3)",
                          }}
                        >
                          <div className="flex flex-wrap items-start gap-x-[18px] gap-y-3">
                            <span className="mono border-od-border-9 text-od-muted-2 inline-flex size-[42px] flex-none items-center justify-center rounded-[9px] border bg-[var(--od-raise-5)] text-[11.5px]">
                              {source.mark}
                            </span>

                            <div className="min-w-[220px] flex-[1_1_260px]">
                              <div className="flex flex-wrap items-center gap-[9px]">
                                <span className="text-od-text text-[15.5px] font-semibold text-pretty">
                                  {source.nameKey ? t[source.nameKey] : source.name}
                                </span>
                                <span
                                  className="rounded-[5px] border p-[2px_9px] text-[11.5px] font-semibold whitespace-nowrap"
                                  style={{
                                    borderColor: tone.border,
                                    background: tone.background,
                                    color: tone.color,
                                  }}
                                >
                                  {t[source.status]}
                                </span>
                              </div>
                              <div
                                dir="ltr"
                                className="mono ltr-data text-od-muted-5 mt-1 text-[12px] [overflow-wrap:anywhere]"
                              >
                                {t[source.meta]}
                              </div>
                              <div className="text-od-muted-2 mt-[6px] text-[13px] text-pretty">
                                {t[source.detail]}
                              </div>

                              {/* A source is read only by the assistants it is assigned to. */}
                              <div className="mt-[9px] flex flex-wrap items-center gap-[7px]">
                                <span className="text-od-faint-2 text-[11.5px] tracking-[.06em] uppercase">
                                  {t.used_by}
                                </span>
                                {source.who.map((name) => (
                                  <span
                                    key={name}
                                    className="rounded-full border border-[color:var(--od-violet-border)] bg-[rgba(139,124,255,.12)] p-[2px_9px] text-[11.5px] font-medium whitespace-nowrap text-[color:var(--od-violet-3)]"
                                  >
                                    {name}
                                  </span>
                                ))}
                                <button
                                  type="button"
                                  className="border-od-stroke-3 text-od-muted-5 hover:text-od-text-2 hover:border-od-faint-3 cursor-pointer rounded-full border border-dashed bg-transparent p-[3px_9px] text-[11.5px]"
                                >
                                  {t.assign}
                                </button>
                              </div>
                            </div>

                            <div className="flex flex-wrap items-center gap-2">
                              <span className="text-od-faint text-[12.5px]">
                                {interpolate(t.used_in, { count: source.used })}
                              </span>
                              <button
                                type="button"
                                className="border-od-border-7 text-od-muted hover:text-od-text-2 cursor-pointer rounded-md border bg-transparent p-[7px_12px] text-[13px] hover:bg-[var(--od-raise-4)]"
                              >
                                {t.open}
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              <div className="flex max-w-[380px] min-w-[min(100%,290px)] flex-[1_1_300px] flex-col gap-[14px]">
                <div className="border-od-line bg-od-panel-deep-3 rounded-[10px] border p-4">
                  <div className="text-od-muted-4 text-[12px] font-semibold tracking-[.07em] uppercase">
                    {t.test_heading}
                  </div>
                  <div className="border-od-border-6 bg-od-canvas-2 text-od-text-3 mt-[10px] rounded-lg border p-[10px_12px]">
                    {t.test_question}
                  </div>
                  <div className="border-od-line bg-od-canvas-2 mt-[10px] rounded-lg border p-[12px_14px]">
                    <div className="text-[14px] leading-[1.65] text-pretty text-[color:var(--od-text-4)]">
                      {t.test_answer}
                    </div>
                    {/* Every answer names its source, so a wrong answer is traceable. */}
                    <div className="text-od-faint mt-2 text-[12px]">
                      {t.test_source}
                    </div>
                  </div>
                  <div className="text-od-faint mt-[10px] text-[12.5px] text-pretty">
                    {t.test_note}
                  </div>
                </div>

                <div className="border-od-line bg-od-panel-deep-3 rounded-[10px] border p-4">
                  <div className="text-od-muted-4 text-[12px] font-semibold tracking-[.07em] uppercase">
                    {t.gaps_heading}
                  </div>
                  <div className="mt-2 flex flex-col">
                    {GAPS.map((gap) => (
                      <div
                        key={gap.q}
                        className="border-od-border grid items-start gap-[10px] border-b py-[10px]"
                        style={{ gridTemplateColumns: "minmax(0,1fr) max-content" }}
                      >
                        <div className="text-od-text-3 min-w-0 text-[13.5px] text-pretty">
                          {t[gap.q]}
                        </div>
                        <span className="text-od-faint text-[12px] whitespace-nowrap">
                          {interpolate(t.gap_callers, { count: gap.count })}
                        </span>
                      </div>
                    ))}
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setAddTab("qa");
                      setAddOpen(true);
                    }}
                    className="border-od-stroke-3 text-od-muted-5 hover:text-od-text-2 hover:border-od-faint-3 mt-3 w-full cursor-pointer rounded-[7px] border border-dashed bg-transparent p-[8px_12px] text-[13px]"
                  >
                    {t.gap_answer}
                  </button>
                  <div className="text-od-faint mt-[10px] text-[12.5px] text-pretty">
                    {t.gaps_note}
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : null}
      </div>

      {addOpen ? (
        <AddSourceDialog t={t} tab={addTab} onTab={setAddTab} onClose={() => setAddOpen(false)} />
      ) : null}
    </div>
  );
}

function AddSourceDialog({
  t,
  tab,
  onTab,
  onClose,
}: {
  t: KnowledgeDictionary;
  tab: string;
  onTab: (id: string) => void;
  onClose: () => void;
}) {
  const [crawlRate, setCrawlRate] = useState("nightly");

  return (
    <div
      className="fixed inset-0 z-[60] flex items-start justify-center overflow-auto p-[60px_24px]"
      style={{ background: "var(--od-scrim-3)" }}
    >
      <div className="border-od-border-9 bg-od-panel w-full max-w-[620px] rounded-xl border p-[22px]">
        <div className="flex flex-wrap items-start justify-between gap-x-5 gap-y-3">
          <div className="min-w-0">
            <h2 className="text-od-text m-0 text-[19px] font-semibold">{t.dialog_title}</h2>
            <p className="text-od-muted-4 mt-[6px] max-w-[54ch] text-pretty">{t.dialog_note}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="border-od-border-7 text-od-muted hover:text-od-text-2 cursor-pointer rounded-md border bg-transparent p-[6px_10px] hover:bg-[var(--od-raise-6)]"
          >
            {t.close}
          </button>
        </div>

        <div className="mt-4 flex flex-wrap gap-[6px]">
          {ADD_TABS.map(({ id, label }) => {
            const on = tab === id;
            return (
              <button
                key={id}
                type="button"
                onClick={() => onTab(id)}
                className="cursor-pointer rounded-[7px] border p-[8px_13px] text-[13.5px] whitespace-nowrap"
                style={{
                  borderColor: on ? "var(--od-stroke)" : "transparent",
                  background: on ? "var(--od-raise-10)" : "transparent",
                  color: on ? "var(--od-text)" : "var(--od-muted-4)",
                }}
              >
                {t[label]}
              </button>
            );
          })}
        </div>

        {tab === "text" ? (
          <div className="border-od-line bg-od-canvas-2 mt-4 overflow-hidden rounded-[10px] border">
            <div className="border-od-line bg-od-panel-deep-3 flex flex-wrap items-center gap-x-[14px] gap-y-[10px] border-b p-[12px_16px]">
              <input
                placeholder={t.text_title_placeholder}
                aria-label={t.text_title_label}
                className="border-od-border-6 bg-od-canvas-2 text-od-text min-w-0 flex-[1_1_220px] rounded-[7px] border p-[8px_11px] text-[15px] font-medium outline-none"
              />
              <span dir="ltr" className="mono ltr-data text-od-faint flex-none text-[12px]">
                parking-and-access.md
              </span>
            </div>
            <textarea
              rows={11}
              placeholder={"# Parking\n\nCourtyard entrance from Lindengasse. The lift is on the left.\n\n## Wheelchair access\n\nTwo marked bays by the courtyard gate."}
              className="mono bg-od-canvas-2 text-od-text-2 block w-full resize-y border-none p-[14px_16px] text-[13.5px] leading-[1.7] outline-none"
            />
            <div className="border-od-line bg-od-panel-deep-3 flex flex-wrap items-center justify-between gap-x-4 gap-y-[10px] border-t p-[11px_16px]">
              <span className="text-od-faint text-[12.5px] text-pretty">
                {t.text_note}
              </span>
              <span dir="ltr" className="mono ltr-data text-od-faint-2 flex-none text-[12px]">
                {interpolate(t.characters, { count: 0 })}
              </span>
            </div>
          </div>
        ) : null}

        {tab === "qa" ? (
          <div className="border-od-line bg-od-canvas-2 mt-4 rounded-[10px] border p-[18px]">
            <div className="text-od-text-2 text-[15.5px] font-semibold">
              {t.qa_heading}
            </div>
            <div className="text-od-muted-4 mt-[5px] text-[13px] text-pretty">
              {t.qa_note}
            </div>

            <div className="mt-4">
              <label className="text-od-text-5 mb-[6px] block text-[12.5px] font-medium">
                {t.qa_question_label}
              </label>
              <input
                placeholder={t.qa_question_placeholder}
                className="border-od-border-6 bg-od-panel-deep-3 text-od-text-2 w-full rounded-lg border p-[10px_13px] text-[15px] outline-none"
              />
              <div className="mt-2 flex flex-wrap gap-[6px]">
                {["Do you come to me?", "Can someone visit?"].map((alt) => (
                  <span
                    key={alt}
                    className="border-od-border-7 text-od-muted-2 inline-flex items-center gap-[7px] rounded-full border bg-[var(--od-raise-5)] p-[4px_10px] text-[12.5px]"
                  >
                    {alt}
                  </span>
                ))}
                <button
                  type="button"
                  className="border-od-stroke-3 text-od-muted-5 hover:text-od-text-2 hover:border-od-faint-3 cursor-pointer rounded-full border border-dashed bg-transparent p-[4px_10px] text-[12.5px]"
                >
                  + another wording
                </button>
              </div>
            </div>

            <div className="mt-4">
              <label className="text-od-text-5 mb-[6px] block text-[12.5px] font-medium">
                {t.qa_answer_label}
              </label>
              <textarea
                rows={3}
                placeholder={t.qa_answer_placeholder}
                className="border-od-border-6 bg-od-panel-deep-3 text-od-text-2 w-full resize-y rounded-lg border p-[11px_13px] text-[14.5px] leading-[1.55] outline-none"
              />
              <div className="text-od-faint mt-[6px] text-[12.5px] text-pretty">
                {t.qa_answer_note}
              </div>
            </div>

            <div className="border-od-border mt-4 flex flex-wrap items-center justify-between gap-x-4 gap-y-[10px] border-t pt-[14px]">
              <span className="text-od-faint text-[12.5px]">{t.qa_count}</span>
              <button
                type="button"
                className="border-od-stroke-3 text-od-muted-5 hover:text-od-text-2 hover:border-od-faint-3 cursor-pointer rounded-[7px] border border-dashed bg-transparent p-[8px_14px] text-[13px]"
              >
                {t.qa_add}
              </button>
            </div>
          </div>
        ) : null}

        {tab === "file" ? (
          <div>
            <div className="border-od-stroke-3 bg-od-canvas-2 mt-4 rounded-[10px] border border-dashed p-[26px_22px] text-center">
              <div className="text-od-text-2 text-[15.5px] font-semibold">{t.files_drop}</div>
              <div className="text-od-muted-4 mx-auto mt-[6px] max-w-[52ch] text-pretty">
                {t.files_note}
              </div>
              <button
                type="button"
                className="border-od-stroke bg-od-raise-10 text-od-text-2 hover:bg-od-border-3 mt-[14px] cursor-pointer rounded-[7px] border p-[9px_16px] font-medium"
              >
                {t.files_choose}
              </button>
            </div>
            <div className="mt-3 flex flex-col gap-[6px]">
              {[
                { ext: "PDF", name: "Preisliste 2026.pdf", size: "88 KB", note: t.file_text_fast },
                { ext: "DOCX", name: "Hausordnung.docx", size: "34 KB", note: t.file_text },
                { ext: "PDF", name: "Scan Anfahrt.pdf", size: "2.1 MB", note: t.file_scanned },
              ].map((file) => (
                <div
                  key={file.name}
                  className="border-od-border-4 bg-od-panel-deep-3 flex flex-wrap items-center gap-x-[14px] gap-y-2 rounded-lg border p-[10px_13px]"
                >
                  <span
                    dir="ltr"
                    className="mono ltr-data border-od-border-7 text-od-muted-2 flex-none rounded border bg-[var(--od-raise-5)] p-[2px_7px] text-[11px]"
                  >
                    {file.ext}
                  </span>
                  <span className="text-od-text-3 min-w-0 flex-[1_1_160px] [overflow-wrap:anywhere]">
                    {file.name}
                  </span>
                  <span dir="ltr" className="mono ltr-data text-od-faint flex-none text-[12px]">
                    {file.size}
                  </span>
                  <span
                    className="text-[12px]"
                    style={{
                      color: file.note.includes("OCR")
                        ? "var(--od-amber-text)"
                        : "var(--od-faint)",
                    }}
                  >
                    {file.note}
                  </span>
                </div>
              ))}
            </div>
          </div>
        ) : null}

        {tab === "web" ? (
          <div className="border-od-line bg-od-canvas-2 mt-4 rounded-[10px] border p-[18px]">
            <label className="text-od-text-5 mb-[6px] block text-[12.5px] font-medium">Address</label>
            <input
              placeholder="https://wagner-partner.at"
              aria-label={t.web_address_label}
              dir="ltr"
              className="mono ltr-data border-od-border-6 bg-od-panel-deep-3 text-od-text-2 w-full rounded-lg border p-[10px_13px] text-[14px] outline-none"
            />
            <div className="text-od-faint mt-[6px] text-[12.5px] text-pretty">
              {t.web_note}
            </div>

            <div className="mt-4">
              <div className="text-od-text-5 mb-[7px] text-[12.5px] font-medium">
                {t.web_rate}
              </div>
              <div className="flex flex-wrap gap-[7px]">
                {CRAWL_RATES.map((rate) => (
                  <button
                    key={rate.id}
                    type="button"
                    onClick={() => setCrawlRate(rate.id)}
                    className={`cursor-pointer rounded-[7px] border p-[7px_11px] text-[13px] whitespace-nowrap ${
                      crawlRate === rate.id
                        ? "border-od-stroke bg-od-line-2 text-od-text"
                        : "border-od-border-7 bg-od-panel-deep-3 text-od-muted-4"
                    }`}
                  >
                    {t[rate.label]}
                  </button>
                ))}
              </div>
            </div>
          </div>
        ) : null}

        {tab === "folder" ? (
          <div className="border-od-line bg-od-canvas-2 mt-4 rounded-[10px] border p-[18px]">
            <label className="text-od-text-5 mb-[6px] block text-[12.5px] font-medium">
              {t.folder_label}
            </label>
            <input
              placeholder="/srv/share/handbuch"
              dir="ltr"
              className="mono ltr-data border-od-border-6 bg-od-panel-deep-3 text-od-text-2 w-full rounded-lg border p-[10px_13px] text-[14px] outline-none"
            />
            <div className="text-od-faint mt-[6px] text-[12.5px] text-pretty">
              {t.folder_note}
            </div>
          </div>
        ) : null}

        <div className="border-od-border mt-5 flex flex-wrap justify-end gap-[10px] border-t pt-4">
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
            {t.add_source}
          </button>
        </div>
      </div>
    </div>
  );
}

function CorruptIndex({ t }: { t: KnowledgeDictionary }) {
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
            {t.error_rebuild}
          </button>
          <button
            type="button"
            className="border-od-border-2 text-od-muted hover:text-od-text-2 cursor-pointer rounded-md border bg-transparent p-[9px_16px]"
          >
            {t.error_log}
          </button>
        </div>
      </div>
    </div>
  );
}
