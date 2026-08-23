"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { Sidebar } from "@/components/shell/sidebar";
import { StatePreview, type ScreenState } from "@/components/state-preview";
import type { Locale } from "@/lib/locales";

import type { CallDetailDictionary } from "./page";

type Key = keyof CallDetailDictionary;

const DURATION = 158;
const ACCENT = "var(--od-violet)";

type Speaker = "caller" | "agent" | "human";

/**
 * A transcript is a record of what was actually said, so its text is never
 * translated - only the labels around it are. The human speaker is a real person,
 * so their name is data too.
 */
type Line =
  | { at: number; marker: "join" | "resume" }
  | { at: number; speaker: Speaker; text: string };

const HUMAN_NAME = "Mohamed";

const TRANSCRIPT: Line[] = [
  { at: 0, speaker: "agent", text: "Wagner & Partner, good morning. This call is recorded. How can I help you?" },
  {
    at: 6,
    speaker: "caller",
    text: "Good morning, Gruber here. I have an appointment on Tuesday and I need to move it.",
  },
  {
    at: 13,
    speaker: "agent",
    text: "Of course, Ms Gruber. I can see your appointment on Tuesday at 14:00. What day would suit you better?",
  },
  { at: 21, speaker: "caller", text: "Thursday would be better, in the morning if possible." },
  { at: 26, speaker: "agent", text: "One moment, let me check the calendar." },
  { at: 31, speaker: "agent", text: "Thursday at 10:00 is free. Should I put you down for that?" },
  {
    at: 36,
    speaker: "caller",
    text: "Yes please. And I wanted to ask about the quote — is it still valid?",
  },
  { at: 44, speaker: "agent", text: "Let me check that for you." },
  { at: 47, marker: "join" },
  {
    at: 49,
    speaker: "human",
    text: "Hello Ms Gruber, this is Mohamed from reception. Your agreement runs until the end of September, so nothing needs renewing yet.",
  },
  { at: 62, speaker: "caller", text: "Perfect, thank you." },
  { at: 64, marker: "resume" },
  {
    at: 66,
    speaker: "agent",
    text: "Then you are booked for Thursday at 10:00. You will get a confirmation by SMS. Anything else?",
  },
  { at: 74, speaker: "caller", text: "No, that is everything. Thank you." },
  { at: 77, speaker: "agent", text: "Thank you for calling, Ms Gruber. Goodbye." },
];

/** Three speaker types, distinct at a glance without being loud (§A6.4). */
const SPEAKERS: Record<Speaker, { color: string; background: string; border: string }> = {
  caller: { color: "var(--od-muted-2)", background: "transparent", border: "transparent" },
  agent: {
    color: "var(--od-violet-3)",
    background: "rgba(139,124,255,.09)",
    border: "rgba(139,124,255,.26)",
  },
  human: {
    color: "var(--od-green-text)",
    background: "rgba(63,185,132,.09)",
    border: "rgba(63,185,132,.30)",
  },
};

/** What an operator typed is also a record, so only the outcome line is copy. */
const WHISPERS: { at: number; label: string; text: string; outcome: Key }[] = [
  {
    at: 44,
    label: "00:44",
    text: "The quote is valid until 30 September. Tell her it does not need redoing.",
    outcome: "whisper_outcome_1",
  },
  {
    at: 64,
    label: "01:04",
    text: "Confirm the booking and close politely.",
    outcome: "whisper_outcome_2",
  },
];

/** Tool names are identifiers; what they were asked for is copy. */
const TOOLS: { name: string; detail: Key; ms: string }[] = [
  { name: "search_knowledge", detail: "tool_knowledge_detail", ms: "240 ms" },
  { name: "check_calendar", detail: "tool_calendar_detail", ms: "890 ms" },
  { name: "check_calendar", detail: "tool_calendar_detail_2", ms: "1,120 ms" },
];

function clock(seconds: number): string {
  const minutes = Math.floor(seconds / 60);
  const rest = Math.floor(seconds % 60);
  return `${String(minutes).padStart(2, "0")}:${String(rest).padStart(2, "0")}`;
}

export function CallDetail({ locale, t }: { locale: Locale; t: CallDetailDictionary }) {
  const [state, setState] = useState<ScreenState>("default");
  const [time, setTime] = useState(34);
  const [playing, setPlaying] = useState(true);

  useEffect(() => {
    if (!playing) return;
    const timer = setInterval(() => setTime((value) => (value >= DURATION ? 0 : value + 1)), 1000);
    return () => clearInterval(timer);
  }, [playing]);

  const offline = state === "offline";
  const empty = state === "empty";
  const showScreen = state === "default" || empty || offline;

  // The line currently being spoken, so the transcript can mark it.
  const spoken = TRANSCRIPT.filter((line) => !("marker" in line));
  const current = spoken.reduce<number>((found, line) => (time >= line.at ? line.at : found), -1);

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
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              className="border-od-red-border-2 bg-od-red-bg-2 hover:bg-od-red-bg-3 cursor-pointer rounded-md border p-[8px_14px] font-medium text-[color:var(--od-red-text-3)]"
            >
              {t.offline_retry}
            </button>
            <button
              type="button"
              className="hover:bg-od-red-bg-2 cursor-pointer rounded-md border border-[color:var(--od-red-border-4)] bg-transparent p-[8px_14px] text-[color:var(--od-red-text-2)]"
            >
              {t.offline_status}
            </button>
          </div>
        </div>
      ) : null}

      <div className="mx-auto max-w-[1560px] p-[26px_28px_72px]">
        {state === "error" ? <RecordingStoreError t={t} /> : null}
        {state === "loading" ? <DetailSkeleton /> : null}

        {showScreen ? (
          <div>
            <div className="text-od-faint mb-4 flex flex-wrap items-center gap-x-[18px] gap-y-[10px] text-[13px]">
              <Link href={`/${locale}/calls`} className="text-od-muted hover:underline">
                {t.breadcrumb_calls}
              </Link>
              <span className="text-[color:var(--od-border-11)]">/</span>
              <span dir="ltr" className="mono ltr-data text-[12px]">
                01J6R4ZK8Q
              </span>
            </div>

            <header className="border-od-border flex flex-wrap items-start justify-between gap-x-10 gap-y-6 border-b pb-[22px]">
              <div className="min-w-[240px] flex-[1_1_300px]">
                <div className="flex flex-wrap items-baseline gap-3">
                  <h1 className="text-od-text m-0 text-[26px] font-semibold tracking-[-0.015em]">
                    Anna Gruber
                  </h1>
                  <a href="#" className="text-od-violet text-[13px] hover:underline">
                    {t.contact_record}
                  </a>
                </div>
                <div dir="ltr" className="mono ltr-data text-od-muted mt-[6px] text-[13.5px]">
                  +43 664 1234567
                </div>
              </div>

              <div className="flex flex-wrap items-start gap-x-[34px] gap-y-[22px]">
                <Fact label={t.fact_date}>
                  {t.fact_date_value}, <span className="mono">09:41</span>
                </Fact>
                <Fact label={t.fact_duration}>
                  <span className="mono">2:38</span>
                </Fact>
                <div>
                  <div className="text-od-faint text-[11px] tracking-[.08em] uppercase">
                    {t.fact_handled}
                  </div>
                  <div className="mt-[5px] inline-flex items-center gap-[7px] rounded-md border border-[color:var(--od-violet-border)] bg-[rgba(139,124,255,.13)] p-[4px_11px] text-[13px] font-medium text-[color:var(--od-violet-3)]">
                    <span className="size-[6px] flex-none rounded-full bg-[color:var(--od-violet)]" />
                    <span>{t.handled_agent}</span>
                  </div>
                </div>
                <Fact label={t.fact_intent}>{t.intent_change}</Fact>
              </div>
            </header>

            <Player
              time={time}
              playing={playing}
              download={t.player_download}
              onToggle={() => setPlaying((value) => !value)}
              onSeek={setTime}
            />

            <div className="mt-[26px] flex flex-wrap items-start gap-[26px]">
              <section className="min-w-[min(100%,420px)] flex-[4_1_480px]">
                <div className="mb-[14px] flex flex-wrap items-baseline justify-between gap-[10px]">
                  <h2 className="text-od-muted-4 m-0 text-[13px] font-semibold tracking-[.07em] uppercase">
                    {t.transcript_heading}
                  </h2>
                  <span className="text-od-faint-2 text-[12px]">{t.transcript_note}</span>
                </div>

                {empty ? (
                  <div className="border-od-border-6 bg-od-panel-deep-2 rounded-[10px] border border-dashed p-[34px_28px]">
                    <div className="border-od-amber-border bg-od-amber-bg inline-flex items-center gap-2 rounded-md border p-[4px_10px] text-[12px] font-semibold text-[color:var(--od-amber-text)]">
                      {t.empty_label}
                    </div>
                    <h3 className="mt-4 mb-0 text-[18px] font-semibold">{t.empty_title}</h3>
                    <p className="text-od-muted mt-[10px] max-w-[60ch] text-pretty">{t.empty_body}</p>
                    <div className="mt-[18px] flex flex-wrap gap-[10px]">
                      <button
                        type="button"
                        className="border-od-stroke bg-od-raise-10 text-od-text-2 hover:bg-od-border-3 cursor-pointer rounded-md border p-[9px_16px] font-medium"
                      >
                        {t.empty_rerun}
                      </button>
                      <button
                        type="button"
                        className="border-od-border-2 text-od-muted hover:text-od-text-2 cursor-pointer rounded-md border bg-transparent p-[9px_16px]"
                      >
                        {t.empty_media}
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col text-[16px]">
                    {TRANSCRIPT.map((line, index) =>
                      "marker" in line ? (
                        <Marker key={index} line={line} t={t} />
                      ) : (
                        <SpeechLine
                          key={index}
                          line={line}
                          t={t}
                          current={line.at === current}
                          onSeek={() => setTime(line.at)}
                        />
                      ),
                    )}
                  </div>
                )}
              </section>

              {/* §A6.4: never inline with what the caller heard. */}
              <section className="max-w-[340px] min-w-[min(100%,260px)] flex-[1_1_260px]">
                <h2 className="text-od-muted-4 mb-[14px] text-[13px] font-semibold tracking-[.07em] uppercase">
                  {t.whisper_heading}
                </h2>
                <div
                  className="border-od-border-10 rounded-[10px] border border-dashed p-[14px]"
                  style={{
                    background:
                      "repeating-linear-gradient(135deg, var(--od-panel-deep) 0 10px, var(--od-panel-deep-4) 10px 20px)",
                  }}
                >
                  <div className="border-od-border-8 flex items-start gap-[9px] border-b border-dashed pb-3">
                    <span className="border-od-stroke-2 flex size-[18px] flex-none items-center justify-center rounded border text-[11px] text-[color:var(--od-muted-3)]">
                      ✕
                    </span>
                    <div className="text-[12.5px] text-pretty text-[color:var(--od-muted-3)]">
                      {t.whisper_internal}
                    </div>
                  </div>

                  {empty ? (
                    <div className="text-od-faint mt-3 text-[13px]">{t.whisper_none}</div>
                  ) : (
                    <div className="mt-3 flex flex-col gap-3">
                      {WHISPERS.map((whisper) => (
                        <div
                          key={whisper.at}
                          onClick={() => setTime(whisper.at)}
                          className="border-od-stroke-3 bg-od-panel-deep-8 hover:border-od-faint-3 cursor-pointer rounded-lg border border-dashed p-3"
                        >
                          <div className="mb-2 flex flex-wrap items-center gap-2">
                            <span dir="ltr" className="mono ltr-data text-od-faint text-[12px]">
                              {whisper.label}
                            </span>
                            <span className="text-[11.5px] font-semibold tracking-[.04em] uppercase text-[color:var(--od-muted-2)]">
                              {t.whisper_from}
                            </span>
                          </div>
                          {/* What the operator typed, verbatim. */}
                          <div
                            dir="ltr"
                            className="text-[14px] leading-[1.6] text-start text-pretty italic text-[color:var(--od-text-6)]"
                          >
                            {whisper.text}
                          </div>
                          <div className="text-od-faint mt-[9px] text-[12px]">
                            {t[whisper.outcome]}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </section>

              <aside className="flex max-w-[380px] min-w-[min(100%,290px)] flex-[1_1_300px] flex-col gap-4">
                <Card title={t.summary_heading}>
                  <p className="mt-[10px] mb-0 text-[14.5px] leading-[1.66] text-pretty text-[color:var(--od-text-5)]">
                    {t.summary_body}
                  </p>
                </Card>

                <Card title={t.intent_heading}>
                  <div className="mt-[10px] flex flex-wrap items-center gap-[10px]">
                    <span className="border-od-border-9 text-od-text-3 rounded-md border bg-[var(--od-raise-5)] p-[4px_10px] text-[13px] font-medium">
                      {t.intent_change}
                    </span>
                    <span dir="ltr" className="mono ltr-data text-od-faint text-[12px]">
                      0.94
                    </span>
                  </div>
                  <div className="text-od-faint mt-[10px] text-[12.5px]">{t.intent_secondary}</div>
                </Card>

                <Card title={t.tools_heading} aside={t.tools_aside}>
                  {/* A failed tool call is the most important thing on this rail. */}
                  <div className="border-od-red-border-3 bg-od-red-bg-4 mt-[14px] rounded-lg border p-[14px]">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="size-2 flex-none rounded-full bg-[#F0605E]" />
                      <span className="text-[12px] font-bold tracking-[.06em] uppercase text-[color:var(--od-red-text-5)]">
                        {t.tool_failed}
                      </span>
                      <span
                        dir="ltr"
                        className="mono ltr-data ms-auto text-[12px] text-[color:var(--od-red-text-7)]"
                      >
                        5,000 ms
                      </span>
                    </div>
                    <div
                      dir="ltr"
                      className="mono ltr-data mt-[9px] text-start text-[13px] text-[color:var(--od-red-text-3)]"
                    >
                      send_notification
                    </div>
                    <div className="mt-1 text-[13.5px] text-pretty text-[color:var(--od-red-text-6)]">
                      {t.tool_failed_body_before}
                      <strong className="font-semibold text-[color:var(--od-red-text)]">
                        {t.tool_failed_body_strong}
                      </strong>
                    </div>
                    <div className="mt-3 flex flex-wrap gap-2">
                      <button
                        type="button"
                        className="border-od-red-border-2 bg-od-red-bg-2 hover:bg-od-red-bg-3 cursor-pointer rounded-md border p-[7px_12px] text-[13px] font-medium text-[color:var(--od-red-text-3)]"
                      >
                        {t.tool_resend}
                      </button>
                      <button
                        type="button"
                        className="hover:bg-od-red-bg-2 cursor-pointer rounded-md border border-[color:var(--od-red-border-4)] bg-transparent p-[7px_12px] text-[13px] text-[color:var(--od-red-text-2)]"
                      >
                        {t.tool_view_log}
                      </button>
                    </div>
                  </div>

                  <div className="mt-[6px] flex flex-col">
                    {TOOLS.map((tool, index) => (
                      <div
                        key={`${tool.name}-${index}`}
                        className="border-od-border grid items-start gap-[10px] border-b py-[11px]"
                        style={{ gridTemplateColumns: "minmax(0,1fr) max-content" }}
                      >
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="size-[6px] flex-none rounded-full bg-[color:var(--od-green)]" />
                            <span
                              dir="ltr"
                              className="mono ltr-data text-[12.5px] [overflow-wrap:anywhere] text-[color:var(--od-text-5)]"
                            >
                              {tool.name}
                            </span>
                          </div>
                          <div className="text-od-muted-5 mt-[3px] ps-[14px] text-[12.5px] text-pretty">
                            {t[tool.detail]}
                          </div>
                        </div>
                        <span dir="ltr" className="mono ltr-data text-od-faint pt-px text-[12px]">
                          {tool.ms}
                        </span>
                      </div>
                    ))}
                  </div>
                </Card>
              </aside>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}

function Fact({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="text-od-faint text-[11px] tracking-[.08em] uppercase">{label}</div>
      <div className="text-od-text-3 mt-[5px]">{children}</div>
    </div>
  );
}

function Card({
  title,
  aside,
  children,
}: {
  title: string;
  aside?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="border-od-line bg-od-panel-deep-3 rounded-[10px] border p-4">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <div className="text-od-muted-4 text-[12px] font-semibold tracking-[.07em] uppercase">
          {title}
        </div>
        {aside ? <span className="text-od-faint text-[12px]">{aside}</span> : null}
      </div>
      {children}
    </div>
  );
}

function Marker({
  line,
  t,
}: {
  line: { at: number; marker: "join" | "resume" };
  t: CallDetailDictionary;
}) {
  const join = line.marker === "join";
  const color = join ? "var(--od-green-text)" : ACCENT;
  const background = join ? "rgba(63,185,132,.12)" : "rgba(139,124,255,.12)";
  const border = join ? "rgba(63,185,132,.45)" : "rgba(139,124,255,.42)";

  return (
    <div className="my-[18px] flex items-center gap-[14px] ps-1">
      <span dir="ltr" className="mono ltr-data text-od-faint w-[52px] flex-none text-[12.5px]">
        {clock(line.at)}
      </span>
      <span className="size-2 flex-none rounded-full" style={{ background: color }} />
      <span
        className="rounded-md border p-[4px_11px] text-[12.5px] font-semibold tracking-[.03em] whitespace-nowrap"
        style={{ borderColor: border, background, color }}
      >
        {join ? t.marker_join : t.marker_resume}
      </span>
      <span
        className="h-px flex-[1_1_40px]"
        style={{ background: `linear-gradient(90deg, ${border}, transparent)` }}
      />
    </div>
  );
}

function SpeechLine({
  line,
  t,
  current,
  onSeek,
}: {
  line: { at: number; speaker: Speaker; text: string };
  t: CallDetailDictionary;
  current: boolean;
  onSeek: () => void;
}) {
  const speaker = SPEAKERS[line.speaker];
  const label =
    line.speaker === "caller"
      ? t.speaker_caller
      : line.speaker === "agent"
        ? t.speaker_agent
        : HUMAN_NAME;

  return (
    <div
      onClick={onSeek}
      className="hover:bg-od-panel-deep-6 relative -mx-3 grid cursor-pointer gap-[18px] rounded-lg p-[9px_12px]"
      style={{ gridTemplateColumns: "52px minmax(78px, max-content) minmax(0,1fr)" }}
    >
      {current ? (
        <>
          <span
            className="pointer-events-none absolute inset-0 rounded-lg"
            style={{ background: "rgba(139,124,255,.10)", border: "1px solid rgba(139,124,255,.34)" }}
          />
          <span className="absolute inset-y-[10px] start-[-12px] w-[3px] rounded-full bg-[color:var(--od-violet)]" />
        </>
      ) : null}
      <span
        dir="ltr"
        className="mono ltr-data text-od-faint-2 relative pt-[3px] text-[12.5px]"
      >
        {clock(line.at)}
      </span>
      <span
        className="relative mt-[2px] self-start rounded-[5px] border py-[2px] text-[12.5px] font-semibold tracking-[.02em] whitespace-nowrap"
        style={{ borderColor: speaker.border, background: speaker.background, color: speaker.color }}
      >
        {label}
      </span>
      {/* The transcript body breathes: generous line height, never monospace. It is
          also a record of speech, so it keeps the direction it was spoken in. */}
      <span
        dir="ltr"
        className="relative text-[16px] leading-[1.72] text-start text-pretty text-[color:var(--od-text-4)]"
      >
        {line.text}
      </span>
    </div>
  );
}

function Player({
  time,
  playing,
  download,
  onToggle,
  onSeek,
}: {
  time: number;
  playing: boolean;
  download: string;
  onToggle: () => void;
  onSeek: (value: number) => void;
}) {
  const bars = Array.from({ length: 132 }, (_, index) => {
    const position = index / 132;
    const seed = Math.sin(index * 12.9898) * 43758.5453;
    const noise = seed - Math.floor(seed);
    const envelope = 0.35 + 0.65 * Math.abs(Math.sin(position * Math.PI * 3.1));
    const gap =
      (position > 0.28 && position < 0.31) || (position > 0.55 && position < 0.575) ? 0.18 : 1;
    const height = Math.max(3, Math.round(46 * envelope * (0.35 + 0.65 * noise) * gap));
    const played = position <= time / DURATION;
    return { height, played };
  });

  return (
    <div className="border-od-line bg-od-panel-deep-3 mt-[22px] rounded-[10px] border p-[16px_20px]">
      <div className="flex flex-wrap items-center gap-[18px]">
        <button
          type="button"
          onClick={onToggle}
          className="border-od-stroke bg-od-raise-10 text-od-text hover:bg-od-border-5 flex size-11 flex-none cursor-pointer items-center justify-center rounded-full border text-[15px]"
        >
          {playing ? "❚❚" : "▶"}
        </button>

        {/* Audio runs from its start to its end left to right in every language, and
            the seek maths below measures from the left edge, so this never mirrors. */}
        <div dir="ltr" className="min-w-[260px] flex-[1_1_420px]">
          <div
            className="relative h-[52px] cursor-pointer"
            onClick={(event) => {
              const rect = event.currentTarget.getBoundingClientRect();
              onSeek(((event.clientX - rect.left) / rect.width) * DURATION);
            }}
          >
            <div className="absolute inset-0 flex items-center gap-[2px]">
              {bars.map((bar, index) => (
                <span
                  key={index}
                  className="flex-[1_1_0] rounded-[1px]"
                  style={{
                    height: bar.height,
                    background: bar.played ? ACCENT : "var(--od-border-6)",
                    opacity: bar.played ? 0.9 : 1,
                  }}
                />
              ))}
              <span
                className="absolute inset-y-0 w-[2px] rounded-[2px] bg-[color:var(--od-violet)]"
                style={{ insetInlineStart: `${(time / DURATION) * 100}%`, transform: "translateX(-1px)" }}
              />
            </div>
          </div>
        </div>

        <div
          dir="ltr"
          className="mono ltr-data text-od-muted flex items-center gap-[14px] text-[13px]"
        >
          <span className="text-od-text-2">{clock(time)}</span>
          <span className="text-[color:var(--od-border-11)]">/</span>
          <span>02:38</span>
        </div>

        <div className="flex gap-2">
          {["1.0×", download].map((label) => (
            <button
              key={label}
              type="button"
              className="border-od-border-7 text-od-muted hover:text-od-text-2 cursor-pointer rounded-md border bg-transparent p-[7px_12px] text-[13px] hover:bg-[var(--od-raise-6)]"
            >
              {label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

function RecordingStoreError({ t }: { t: CallDetailDictionary }) {
  return (
    <div className="flex justify-center py-[90px]">
      <div className="border-od-border-9 bg-od-panel w-full max-w-[560px] rounded-xl border p-8">
        <div className="border-od-red-border bg-od-red-bg inline-flex items-center gap-2 rounded-md border p-[5px_10px] text-[12px] font-semibold text-[color:var(--od-red-text)]">
          {t.error_label}
        </div>
        <h2 className="mt-[18px] mb-0 text-[21px] font-semibold tracking-[-0.01em]">
          {t.error_title}
        </h2>
        <p className="text-od-muted mt-[10px] max-w-[46ch] text-pretty">{t.error_body}</p>
        <div className="border-od-border-2 bg-od-canvas-2 text-od-muted mt-[18px] rounded-lg border p-[12px_14px] text-[13px]">
          <div className="text-od-text-2 mb-[6px] font-medium">{t.error_try_heading}</div>
          <div>{t.error_try_body}</div>
        </div>
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
            {t.error_diagnostics}
          </button>
        </div>
        <div
          dir="ltr"
          className="border-od-border mono ltr-data text-od-faint mt-[18px] flex flex-wrap gap-4 border-t pt-[14px] text-[11.5px]"
        >
          <span>call_id 01J6R4ZK8Q</span>
          <span>storage/timeout</span>
          <span>2026-08-16 11:04:22</span>
        </div>
      </div>
    </div>
  );
}

function DetailSkeleton() {
  const shimmer = (from: string, to: string) => ({
    background: `linear-gradient(90deg,var(${from}),var(${to}),var(${from}))`,
    backgroundSize: "420px 100%",
    animation: "od-shimmer 1.4s linear infinite",
  });

  return (
    <div>
      <div className="border-od-border flex flex-wrap items-start justify-between gap-6 border-b pb-[22px]">
        <div className="flex-[1_1_320px]">
          <div className="h-[26px] w-[210px] rounded-md" style={shimmer("--od-raise-4", "--od-raise-13")} />
          <div
            className="mt-[10px] h-[14px] w-[150px] rounded-[5px]"
            style={shimmer("--od-raise-2", "--od-raise-11")}
          />
        </div>
        <div className="flex gap-[26px]">
          {[120, 90, 130].map((width) => (
            <div
              key={width}
              className="h-10 rounded-md"
              style={{ width, ...shimmer("--od-raise-2", "--od-raise-11") }}
            />
          ))}
        </div>
      </div>
      <div
        className="border-od-raise-12 mt-[22px] h-24 rounded-[10px] border"
        style={shimmer("--od-panel", "--od-raise-7")}
      />
      <div
        className="mt-[26px] grid gap-7"
        style={{ gridTemplateColumns: "minmax(0,1fr) 320px" }}
      >
        <div className="flex flex-col gap-5">
          {[88, 72, 94, 60, 90, 78, 66].map((width, index) => (
            <div
              key={index}
              className="grid items-start gap-4"
              style={{ gridTemplateColumns: "56px 96px minmax(0,1fr)" }}
            >
              <div className="h-3 rounded bg-[var(--od-raise-4)]" />
              <div className="h-3 rounded bg-[var(--od-raise-9)]" />
              <div
                className="h-3 rounded"
                style={{ width: `${width}%`, ...shimmer("--od-raise-2", "--od-raise-11") }}
              />
            </div>
          ))}
        </div>
        <div className="flex flex-col gap-[14px]">
          {[150, 210].map((height) => (
            <div
              key={height}
              className="border-od-raise-12 rounded-[10px] border"
              style={{ height, ...shimmer("--od-panel", "--od-raise-7") }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
