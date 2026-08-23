"use client";

import Link from "next/link";
import { useState } from "react";

import { Sidebar } from "@/components/shell/sidebar";
import { StatePreview, type ScreenState } from "@/components/state-preview";
import type { Locale } from "@/lib/locales";

import type { HomeDictionary } from "./page";

type Key = keyof HomeDictionary;
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

/** Caller names are data; "Unknown caller" is a label the interface supplies. */
const RECENT: {
  time: string;
  name?: string;
  nameKey?: Key;
  intent: Key;
  handled: Handled;
  length: string;
}[] = [
  { time: "09:41", name: "Anna Gruber", intent: "intent_change", handled: "agent", length: "02:38" },
  { time: "09:12", nameKey: "caller_unknown", intent: "intent_spam", handled: "blocked", length: "00:04" },
  { time: "08:55", name: "Josef Hofer", intent: "intent_new", handled: "agent", length: "01:52" },
  { time: "08:31", name: "Elisabeth Mayr", intent: "intent_billing", handled: "human", length: "04:11" },
  { time: "08:04", name: "Markus Steiner", intent: "intent_cancel", handled: "agent", length: "00:58" },
];

const CALLBACK: { name: string; why: Key; time?: string; timeKey?: Key }[] = [
  { name: "Anna Gruber", why: "callback_sms_why", time: "09:44" },
  { name: "+43 1 555 0182", why: "callback_hangup_why", time: "09:12" },
  { name: "Hoffmann GmbH", why: "callback_quote_why", timeKey: "when_yesterday" },
];

const KEYS: [string, string][] = [
  ["1", ""],
  ["2", "ABC"],
  ["3", "DEF"],
  ["4", "GHI"],
  ["5", "JKL"],
  ["6", "MNO"],
  ["7", "PQRS"],
  ["8", "TUV"],
  ["9", "WXYZ"],
  ["*", ""],
  ["0", "+"],
  ["#", ""],
];

export function Home({ locale, t }: { locale: Locale; t: HomeDictionary }) {
  const [state, setState] = useState<ScreenState>("default");

  const offline = state === "offline";
  const empty = state === "empty";
  const showHome = state === "default" || empty || offline;

  return (
    <div className="bg-od-canvas text-od-text-2 min-h-dvh text-[14px] leading-[1.45] ps-[224px]">
      <div className="fixed inset-y-0 start-0 z-50 h-dvh w-[224px]">
        <Sidebar locale={locale} active="home" incomingCall />
      </div>

      <StatePreview state={state} onChange={setState} />

      {offline ? <OfflineBanner t={t} /> : null}

      <div className="mx-auto max-w-[1240px] p-[22px_28px_60px]">
        {state === "error" ? <DatabaseError t={t} /> : null}
        {state === "loading" ? <HomeSkeleton /> : null}

        {showHome ? (
          <div>
            <div className="flex flex-wrap items-baseline justify-between gap-x-5 gap-y-[14px]">
              <h1 className="text-od-text m-0 text-[26px] font-semibold tracking-[-0.02em]">
                {t.greeting}
              </h1>
              <div className="text-od-muted-4">{t.today}</div>
            </div>

            {!empty ? (
              <Link
                href={`/${locale}/notifications`}
                className="border-od-red-border-3 bg-od-red-bg-4 hover:bg-od-red-bg-2 mt-[18px] flex flex-wrap items-center gap-x-4 gap-y-[10px] rounded-[10px] border p-[13px_16px] hover:no-underline"
              >
                <span
                  className="size-[9px] flex-none rounded-full bg-[#F0605E]"
                  style={{ animation: "od-ring 1.6s ease-out infinite" }}
                />
                <span className="min-w-0 flex-[1_1_260px]">
                  <span className="block text-[14.5px] font-semibold text-[color:var(--od-red-text-3)]">
                    {t.waiting_title}
                  </span>
                  <span className="mt-[2px] block text-[13px] text-pretty text-[color:var(--od-red-text-6)]">
                    {t.waiting_body}
                  </span>
                </span>
                <span className="flex-none text-[13px] whitespace-nowrap text-[color:var(--od-red-text-2)]">
                  {t.waiting_link}
                </span>
              </Link>
            ) : null}

            <section className="mt-5 flex flex-wrap items-start gap-4">
              <div className="order-1 min-w-[min(100%,420px)] flex-[2_1_460px]">
                <div className="mb-[10px] flex flex-wrap items-baseline justify-between gap-[10px]">
                  <h2 className="text-od-muted-4 m-0 text-[13px] font-semibold tracking-[.07em] uppercase">
                    {t.recent_heading}
                  </h2>
                  <Link href={`/${locale}/calls`} className="text-od-violet text-[13px] hover:underline">
                    {t.all_calls}
                  </Link>
                </div>

                {empty ? (
                  <div className="border-od-border-6 bg-od-panel-deep-2 rounded-[10px] border border-dashed p-[30px]">
                    <h3 className="m-0 text-[17px] font-semibold">{t.empty_title}</h3>
                    <p className="text-od-muted mt-2 max-w-[56ch] text-pretty">{t.empty_body}</p>
                  </div>
                ) : (
                  <div className="border-od-line bg-od-panel-deep-3 overflow-hidden rounded-[10px] border">
                    {RECENT.map((call) => {
                      const badge = BADGES[call.handled];
                      return (
                        <div
                          key={call.time}
                          className="hover:bg-od-raise grid cursor-pointer items-center gap-[18px] border-b border-[color:var(--od-raise-6)] p-[10px_16px]"
                          style={{
                            gridTemplateColumns:
                              "minmax(96px, max-content) minmax(0,1fr) minmax(120px, max-content) minmax(80px, max-content)",
                          }}
                        >
                          <span dir="ltr" className="mono ltr-data text-od-muted-5 text-[12.5px]">
                            {call.time}
                          </span>
                          <div className="min-w-0">
                            <div className="text-od-text font-medium">
                              {call.nameKey ? t[call.nameKey] : call.name}
                            </div>
                            <div className="text-od-muted-5 mt-[2px] text-[13px]">
                              {t[call.intent]}
                            </div>
                          </div>
                          <span
                            className="inline-flex justify-self-start rounded-md border p-[3px_10px] text-[12.5px] font-medium whitespace-nowrap"
                            style={{
                              borderColor: badge.border,
                              background: badge.background,
                              color: badge.color,
                            }}
                          >
                            {t[badge.label]}
                          </span>
                          <span dir="ltr" className="mono ltr-data text-od-muted text-[13px]">
                            {call.length}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              <DialCard locale={locale} offline={offline} t={t} />
            </section>
          </div>
        ) : null}
      </div>
    </div>
  );
}

function OfflineBanner({ t }: { t: HomeDictionary }) {
  return (
    <div className="bg-od-red-bg border-od-red-border flex flex-wrap items-center gap-[14px] border-b px-7 py-4">
      <span
        className="size-[10px] flex-none rounded-full bg-[#F0605E]"
        style={{ animation: "od-ring 1.6s ease-out infinite" }}
      />
      <div className="min-w-[240px] flex-[1_1_340px]">
        <div className="text-[16px] font-semibold text-[color:var(--od-red-text)]">
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
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          className="border-od-red-border-2 bg-od-red-bg-2 hover:bg-od-red-bg-3 cursor-pointer rounded-md border p-[9px_15px] font-medium text-[color:var(--od-red-text-3)]"
        >
          {t.offline_retry}
        </button>
        <button
          type="button"
          className="hover:bg-od-red-bg-2 cursor-pointer rounded-md border border-[color:var(--od-red-border-4)] bg-transparent p-[9px_15px] text-[color:var(--od-red-text-2)]"
        >
          {t.offline_forward}
        </button>
      </div>
    </div>
  );
}

/**
 * §A6.2 calls the dial card "deliberately minor" — the user is not a switchboard
 * operator. It sits in the side column and never takes the lead.
 */
function DialCard({
  locale,
  offline,
  t,
}: {
  locale: Locale;
  offline: boolean;
  t: HomeDictionary;
}) {
  const [dialed, setDialed] = useState("");
  const [speaker, setSpeaker] = useState<"you" | "agent">("you");

  const ready = dialed.replace(/\D/g, "").length >= 6;
  const byAgent = speaker === "agent";
  const canCall = ready && !offline;

  const hint = offline
    ? t.hint_offline
    : dialed === ""
      ? t.hint_empty
      : !ready
        ? t.hint_partial
        : byAgent
          ? t.hint_agent
          : t.hint_you;

  return (
    <div className="border-od-line bg-od-panel-deep-3 order-2 max-w-[380px] min-w-[min(100%,300px)] flex-[1_1_320px] rounded-[10px] border p-[18px]">
      <h2 className="text-od-muted-4 m-0 text-[13px] font-semibold tracking-[.07em] uppercase">
        {t.dial_heading}
      </h2>

      <div className="border-od-border-4 bg-od-canvas-2 mt-[11px] flex gap-1 rounded-lg border p-[3px]">
        {(
          [
            ["you", t.speaker_you],
            ["agent", t.speaker_assistant],
          ] as const
        ).map(([id, label]) => (
          <button
            key={id}
            type="button"
            onClick={() => setSpeaker(id)}
            className={`flex-[1_1_0] cursor-pointer rounded-md border p-[7px_10px] text-[13px] ${
              speaker === id
                ? "border-od-border-9 text-od-text bg-[var(--od-raise-7)] font-medium"
                : "text-od-faint border-transparent bg-transparent"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      <input
        value={dialed}
        onChange={(event) => setDialed(event.target.value.slice(0, 18))}
        placeholder={t.dial_placeholder}
        inputMode="tel"
        aria-label={t.dial_label}
        dir="ltr"
        className="mono ltr-data border-od-border-6 bg-od-canvas-2 text-od-text mt-[11px] w-full rounded-lg border p-[12px_14px] text-[19px] tracking-[.02em] outline-none"
      />
      <div className="text-od-faint mt-[6px] min-h-[18px] text-[12.5px] text-pretty">{hint}</div>

      {/* A telephone keypad reads 1-2-3 left to right on every handset ever made,
          so it never mirrors with the page. */}
      <div dir="ltr" className="mt-[13px] grid grid-cols-3 gap-2">
        {KEYS.map(([digit, sub]) => (
          <button
            key={digit}
            type="button"
            onClick={() => setDialed((value) => (value + digit).slice(0, 18))}
            className="border-od-border-7 bg-od-canvas-2 text-od-text-2 hover:bg-od-raise flex cursor-pointer flex-col items-center justify-center gap-px rounded-lg border p-[9px_0]"
          >
            <span className="mono ltr-data text-[18px]">{digit}</span>
            {sub ? (
              <span className="text-od-faint-2 text-[9.5px] tracking-[.12em]">{sub}</span>
            ) : null}
          </button>
        ))}
      </div>

      <div className="mt-[13px] flex flex-wrap gap-2">
        <Link
          href={`/${locale}/live`}
          aria-disabled={!canCall}
          className="inline-flex flex-[1_1_auto] items-center justify-center rounded-lg border p-[11px_18px] font-semibold hover:no-underline"
          style={{
            borderColor: canCall ? "var(--od-violet-border)" : "var(--od-border-7)",
            background: canCall ? "var(--od-violet)" : "transparent",
            color: canCall ? "#fff" : "var(--od-faint-2)",
            pointerEvents: canCall ? "auto" : "none",
          }}
        >
          {byAgent ? t.call_by_assistant : t.call}
        </Link>
        <button
          type="button"
          onClick={() => setDialed((value) => value.slice(0, -1))}
          aria-label={t.delete_digit}
          className="border-od-border-7 text-od-muted-4 hover:text-od-text-2 flex-none cursor-pointer rounded-lg border bg-transparent p-[11px_15px] text-[15px] leading-none hover:bg-[var(--od-raise-4)]"
        >
          ⌫
        </button>
      </div>

      <div className="border-od-border mt-4 border-t pt-[14px]">
        <div className="text-od-faint-2 text-[11.5px] tracking-[.07em] uppercase">
          {t.callback_heading}
        </div>
        <div className="mt-2 flex flex-col gap-[2px]">
          {CALLBACK.map((entry) => (
            <button
              key={entry.name}
              type="button"
              onClick={() => setDialed(entry.name.startsWith("+") ? entry.name : "")}
              className="hover:bg-od-raise flex cursor-pointer items-center justify-between gap-[10px] rounded-[7px] border-none bg-transparent p-[8px_10px] text-start"
            >
              <span className="min-w-0">
                <span className="text-od-text-3 block text-[13.5px]">{entry.name}</span>
                <span className="text-od-faint mt-[2px] block text-[12px]">{t[entry.why]}</span>
              </span>
              {entry.timeKey ? (
                <span className="text-od-faint-2 flex-none text-[11.5px]">{t[entry.timeKey]}</span>
              ) : (
                <span
                  dir="ltr"
                  className="mono ltr-data text-od-faint-2 flex-none text-[11.5px]"
                >
                  {entry.time}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

function DatabaseError({ t }: { t: HomeDictionary }) {
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
            {t.error_reload}
          </button>
          <button
            type="button"
            className="border-od-border-2 text-od-muted hover:text-od-text-2 cursor-pointer rounded-md border bg-transparent p-[9px_16px]"
          >
            {t.error_logs}
          </button>
        </div>
        <div
          dir="ltr"
          className="border-od-border mono ltr-data text-od-faint mt-[18px] flex flex-wrap gap-4 border-t pt-[14px] text-[11.5px]"
        >
          <span>db/connection-refused</span>
          <span>telagent-db:5432</span>
          <span>2026-08-16 11:04:22</span>
        </div>
      </div>
    </div>
  );
}

function HomeSkeleton() {
  const shimmer = (from: string, to: string) => ({
    background: `linear-gradient(90deg,var(${from}),var(${to}),var(${from}))`,
    backgroundSize: "420px 100%",
    animation: "od-shimmer 1.4s linear infinite",
  });

  return (
    <div>
      <div className="h-7 w-[220px] rounded-md" style={shimmer("--od-raise-4", "--od-raise-13")} />
      <div className="mt-[22px] flex flex-wrap gap-[14px]">
        {[0, 1].map((index) => (
          <div
            key={index}
            className="border-od-raise-12 h-[116px] flex-[1_1_300px] rounded-[10px] border"
            style={shimmer("--od-panel", "--od-raise-7")}
          />
        ))}
      </div>
      <div className="border-od-line mt-[26px] overflow-hidden rounded-[10px] border">
        {[70, 88, 62, 90, 76, 84].map((width, index) => (
          <div
            key={index}
            className="grid gap-[18px] border-b border-[color:var(--od-raise-6)] p-[15px_18px]"
            style={{ gridTemplateColumns: "120px minmax(0,1fr) 120px" }}
          >
            <div className="h-3 rounded bg-[var(--od-raise-4)]" />
            <div
              className="h-3 rounded"
              style={{ width: `${width}%`, ...shimmer("--od-raise-2", "--od-raise-11") }}
            />
            <div className="h-3 rounded bg-[var(--od-raise-4)]" />
          </div>
        ))}
      </div>
    </div>
  );
}
