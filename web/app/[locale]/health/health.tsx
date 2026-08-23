"use client";

import { useState } from "react";

import { Sidebar } from "@/components/shell/sidebar";
import { StatePreview, type ScreenState } from "@/components/state-preview";
import type { Locale } from "@/lib/locales";

import type { HealthDictionary } from "./page";

type Key = keyof HealthDictionary;

/**
 * Every row says what breaks for a caller if that part stops - a green dot on its own
 * tells an owner nothing they can act on.
 *
 * A measurement in milliseconds is data; "registered" and "up 3 d" are words, so
 * those carry keys instead.
 */
type ServiceId = "web" | "sip" | "llm" | "stt" | "tts" | "db" | "smtp";

const SERVICES: {
  id: ServiceId;
  name: Key;
  impact: Key;
  metric?: string;
  metricKey?: Key;
  downMetricKey?: Key;
  slowMetric?: string;
  uptime: Key;
  downUptime?: Key;
  broken: boolean;
  action?: Key;
}[] = [
  {
    id: "web",
    name: "service_web",
    impact: "service_web_impact",
    metric: "8 ms",
    uptime: "uptime_14d",
    broken: false,
  },
  {
    id: "sip",
    name: "service_sip",
    impact: "service_sip_impact",
    metricKey: "service_sip_metric",
    downMetricKey: "service_sip_metric_down",
    uptime: "uptime_3d",
    downUptime: "uptime_down_6min",
    broken: false,
  },
  {
    id: "llm",
    name: "service_llm",
    impact: "service_llm_impact",
    metric: "0.9 s",
    slowMetric: "4.1 s",
    uptime: "uptime_3d",
    broken: false,
  },
  {
    id: "stt",
    name: "service_stt",
    impact: "service_stt_impact",
    metric: "0.3 s",
    uptime: "uptime_14d",
    broken: false,
  },
  {
    id: "tts",
    name: "service_tts",
    impact: "service_tts_impact",
    metric: "0.1 s",
    uptime: "uptime_14d",
    broken: false,
  },
  {
    id: "db",
    name: "service_db",
    impact: "service_db_impact",
    metric: "2 ms",
    uptime: "uptime_14d",
    broken: false,
  },
  {
    id: "smtp",
    name: "service_smtp",
    impact: "service_smtp_impact",
    metricKey: "service_smtp_metric",
    uptime: "uptime_down_6d",
    broken: true,
    action: "service_smtp_action",
  },
];

const STORAGE: { label: Key; value: string; valueKey?: Key; fraction: number; note: Key }[] = [
  { label: "storage_recordings", value: "18.4 GB", fraction: 0.22, note: "storage_recordings_note" },
  { label: "storage_transcripts", value: "312 MB", fraction: 0.04, note: "storage_transcripts_note" },
  { label: "storage_models", value: "6.7 GB", fraction: 0.08, note: "storage_models_note" },
  {
    label: "storage_free",
    value: "",
    valueKey: "storage_free_value",
    fraction: 0.69,
    note: "storage_free_note",
  },
];

/** Milliseconds from end of caller speech to first audio out — the Rule 3 metric. */
const LATENCY = [
  820, 760, 900, 880, 940, 1010, 3400, 1180, 960, 900, 870, 910, 880, 940, 3600, 1240, 980, 930, 900,
  880, 910, 890, 940, 900,
];

const LOG = [
  { time: "11:04:22", level: "warn", service: "smtp", message: "connect ECONNREFUSED smtp.easyname.com:587" },
  { time: "11:02:10", level: "info", service: "sip", message: "REGISTER ok, expires 3600" },
  { time: "10:58:41", level: "info", service: "agent", message: "call 01J6R4ZK8Q ended, 2:38, 4 tool calls" },
  { time: "10:56:03", level: "warn", service: "llm", message: "reload after idle 900s, first token 3.4s" },
  { time: "10:51:55", level: "info", service: "stt", message: "de-AT model warm, avg 284ms over 40 turns" },
  { time: "10:44:12", level: "error", service: "tools", message: "send_notification timeout after 8000ms" },
  { time: "10:44:04", level: "info", service: "agent", message: "call 01J6R4ZJ2P transferred to ext 10" },
  { time: "10:39:30", level: "info", service: "db", message: "vacuum complete, 41MB reclaimed" },
  { time: "10:12:08", level: "info", service: "backup", message: "snapshot 1.4GB to nas.wagner-partner.local" },
];

type LogFilter = "all" | "errors" | "warnings" | "calls";

const LOG_FILTERS: { id: LogFilter; label: Key }[] = [
  { id: "all", label: "log_all" },
  { id: "errors", label: "log_errors" },
  { id: "warnings", label: "log_warnings" },
  { id: "calls", label: "log_calls" },
];

export function Health({ locale, t }: { locale: Locale; t: HealthDictionary }) {
  // This screen's states are health levels, not the usual five.
  const [state, setState] = useState<ScreenState>("default");
  const [level, setLevel] = useState<LogFilter>("all");

  const degraded = state === "empty";
  const down = state === "error";

  const isBad = (id: ServiceId) =>
    down ? id === "sip" || id === "smtp" : degraded ? id === "llm" || id === "smtp" : id === "smtp";

  const verdict = down
    ? { title: t.verdict_down_title, body: t.verdict_down_body }
    : degraded
      ? { title: t.verdict_degraded_title, body: t.verdict_degraded_body }
      : { title: t.verdict_ok_title, body: t.verdict_ok_body };

  const logLines = LOG.filter((line) => {
    if (level === "all") return true;
    if (level === "errors") return line.level === "error";
    if (level === "warnings") return line.level === "warn" || line.level === "error";
    return line.service === "agent" || line.service === "tools";
  });

  return (
    <div className="bg-od-canvas text-od-text-2 min-h-dvh text-[14px] leading-[1.45] ps-[224px]">
      <div className="fixed inset-y-0 start-0 z-50 h-dvh w-[224px]">
        <Sidebar locale={locale} active="settings" liveCalls={0} />
      </div>

      <StatePreview
        state={state}
        onChange={setState}
        states={["default", "empty", "error"]}
        labels={{ default: "Healthy", empty: "Degraded", error: "Line down" }}
      />

      <div className="mx-auto max-w-[1080px] p-[26px_28px_80px]">
        <div className="flex flex-wrap items-start justify-between gap-x-5 gap-y-[14px]">
          <div className="min-w-0 max-w-[64ch] flex-[1_1_320px]">
            <h1 className="text-od-text m-0 text-[26px] font-semibold tracking-[-0.02em]">
              {t.title}
            </h1>
            <p className="text-od-muted-4 mt-[6px] text-pretty">{t.intro}</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              className="border-od-border-2 text-od-muted hover:text-od-text-2 cursor-pointer rounded-[7px] border bg-transparent p-[9px_15px] text-[13px] whitespace-nowrap hover:bg-[var(--od-raise-4)]"
            >
              {t.download_diagnostics}
            </button>
            <button
              type="button"
              className="border-od-stroke bg-od-raise-10 text-od-text-2 hover:bg-od-border-3 cursor-pointer rounded-[7px] border p-[9px_15px] text-[13px] font-medium whitespace-nowrap"
            >
              {t.recheck}
            </button>
          </div>
        </div>

        <div
          className="mt-5 flex flex-wrap items-start gap-x-4 gap-y-3 rounded-[11px] border p-[15px_17px]"
          style={{
            borderColor: down
              ? "var(--od-red-border-3)"
              : degraded
                ? "var(--od-amber-border-2)"
                : "var(--od-line)",
            background: down
              ? "var(--od-red-bg-4)"
              : degraded
                ? "var(--od-amber-bg-2)"
                : "var(--od-panel-deep-2)",
          }}
        >
          <span
            className="mt-[5px] size-[11px] flex-none rounded-full"
            style={{
              background: down ? "#F0605E" : degraded ? "var(--od-amber)" : "var(--od-green)",
              animation: down ? "od-ring 1.6s ease-out infinite" : "none",
            }}
          />
          <div className="min-w-[240px] flex-[1_1_320px]">
            <div
              className="text-[16px] font-semibold"
              style={{
                color: down
                  ? "var(--od-red-text-3)"
                  : degraded
                    ? "var(--od-amber-text-2)"
                    : "var(--od-text)",
              }}
            >
              {verdict.title}
            </div>
            <div
              className="mt-1 max-w-[70ch] text-[13px] text-pretty"
              style={{
                color: down
                  ? "var(--od-red-text-6)"
                  : degraded
                    ? "var(--od-amber-text-3)"
                    : "var(--od-muted)",
              }}
            >
              {verdict.body}
            </div>
          </div>
          <span className="text-od-faint flex-none text-[12px] whitespace-nowrap">{t.checked}</span>
        </div>

        <section className="mt-[22px]">
          <h2 className="text-od-muted-4 mt-0 mb-3 text-[13px] font-semibold tracking-[.07em] uppercase">
            {t.services_heading}
          </h2>
          <div className="border-od-line bg-od-panel-deep-3 overflow-hidden rounded-[10px] border">
            {SERVICES.map((service, index) => {
              const bad = isBad(service.id);
              const hard = service.broken || (down && service.id === "sip");
              const color = hard
                ? "var(--od-red-text-4)"
                : bad
                  ? "var(--od-amber-text)"
                  : "var(--od-green-text)";
              const border = hard
                ? "var(--od-red-border)"
                : bad
                  ? "var(--od-amber-border)"
                  : "var(--od-green-border)";
              const background = hard
                ? "rgba(240,96,94,.11)"
                : bad
                  ? "var(--od-amber-bg)"
                  : "rgba(63,185,132,.10)";

              return (
                <div
                  key={service.id}
                  className={`flex flex-wrap items-start gap-x-[14px] gap-y-[10px] p-[14px_16px] ${
                    index === 0 ? "" : "border-t border-[color:var(--od-raise-6)]"
                  }`}
                >
                  <span
                    className="mt-[6px] size-[9px] flex-none rounded-full"
                    style={{
                      background: color,
                      animation: hard ? "od-ring 1.6s ease-out infinite" : "none",
                    }}
                  />
                  <div className="min-w-[200px] flex-[1_1_240px]">
                    <div className="flex flex-wrap items-center gap-[9px]">
                      <span className="text-od-text-3 font-medium">{t[service.name]}</span>
                      <span
                        className="rounded-[5px] border p-[2px_9px] text-[11px] font-semibold whitespace-nowrap"
                        style={{ borderColor: border, background, color }}
                      >
                        {hard ? t.state_down : bad ? t.state_slow : t.state_running}
                      </span>
                    </div>
                    <div className="text-od-muted-5 mt-[3px] max-w-[62ch] text-[12.5px] text-pretty">
                      {t[service.impact]}
                    </div>
                  </div>
                  <div className="min-w-[96px] flex-none text-end">
                    {/* A duration is a numeral; a status word is copy. */}
                    {service.metricKey ? (
                      <div className="text-od-muted-4 text-[12px]">
                        {t[hard ? (service.downMetricKey ?? service.metricKey) : service.metricKey]}
                      </div>
                    ) : (
                      <div dir="ltr" className="mono ltr-data text-od-muted-4 text-[12px]">
                        {bad ? (service.slowMetric ?? service.metric) : service.metric}
                      </div>
                    )}
                    <div className="text-od-faint-2 mt-[2px] text-[11px]">
                      {t[hard ? (service.downUptime ?? service.uptime) : service.uptime]}
                    </div>
                  </div>
                  {bad ? (
                    <button
                      type="button"
                      className="flex-none cursor-pointer rounded-[7px] border bg-transparent p-[7px_12px] text-[12.5px] whitespace-nowrap"
                      style={{ borderColor: border, color }}
                    >
                      {service.action ? t[service.action] : t.restart}
                    </button>
                  ) : null}
                </div>
              );
            })}
          </div>
        </section>

        <section className="mt-6 flex flex-wrap items-start gap-4">
          <div className="border-od-line bg-od-panel-deep-3 min-w-[min(100%,280px)] flex-[1_1_300px] rounded-[10px] border p-[18px]">
            <h2 className="text-od-muted-4 m-0 text-[13px] font-semibold tracking-[.07em] uppercase">
              {t.storage_heading}
            </h2>
            <div className="mt-[14px] flex flex-col gap-[14px]">
              {STORAGE.map((entry) => (
                <div key={entry.label}>
                  <div className="flex flex-wrap items-baseline justify-between gap-x-[14px] gap-y-2">
                    <span className="text-od-text-3 text-[13.5px]">{t[entry.label]}</span>
                    {entry.valueKey ? (
                      <span className="text-od-muted-4 text-[12px]">{t[entry.valueKey]}</span>
                    ) : (
                      <span dir="ltr" className="mono ltr-data text-od-muted-4 text-[12px]">
                        {entry.value}
                      </span>
                    )}
                  </div>
                  <div className="mt-[7px] h-1 rounded-full bg-[var(--od-raise-4)]">
                    <span
                      className="block h-1 rounded-full"
                      style={{
                        width: `${Math.max(entry.fraction * 100, 2)}%`,
                        background:
                          entry.fraction > 0.85 ? "var(--od-amber)" : "var(--od-violet)",
                      }}
                    />
                  </div>
                  <div className="text-od-faint mt-[5px] text-[12px] text-pretty">
                    {t[entry.note]}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="border-od-line bg-od-panel-deep-3 min-w-[min(100%,280px)] flex-[1_1_300px] rounded-[10px] border p-[18px]">
            <h2 className="text-od-muted-4 m-0 text-[13px] font-semibold tracking-[.07em] uppercase">
              {t.latency_heading}
            </h2>
            {/* Oldest to newest, left to right, whichever way the page reads - the axis
                below says so, and a mirrored chart would contradict it. */}
            <div
              dir="ltr"
              className="border-od-border-2 mt-4 flex h-24 items-end gap-[3px] border-b pb-[5px]"
            >
              {LATENCY.map((ms, index) => {
                const slow = ms > 2000;
                return (
                  <span
                    key={index}
                    className="block min-w-[3px] flex-[1_1_0] rounded-t-[3px]"
                    style={{
                      height: `${Math.min(Math.round((ms / 3600) * 88), 88)}px`,
                      background: slow ? "var(--od-amber)" : "var(--od-violet)",
                    }}
                  />
                );
              })}
            </div>
            {/* The axis runs oldest to newest whichever way the page reads. */}
            <div dir="ltr" className="text-od-faint-2 mt-[7px] flex justify-between text-[11px]">
              <span>{t.latency_start}</span>
              <span>{t.latency_end}</span>
            </div>
            <div className="text-od-muted-5 mt-3 text-[12.5px] text-pretty">{t.latency_note}</div>
          </div>
        </section>

        <section className="mt-6">
          <div className="mb-3 flex flex-wrap items-baseline justify-between gap-x-4 gap-y-[10px]">
            <h2 className="text-od-muted-4 m-0 text-[13px] font-semibold tracking-[.07em] uppercase">
              {t.log_heading}
            </h2>
            <div className="flex flex-wrap gap-2">
              {LOG_FILTERS.map((entry) => {
                const on = level === entry.id;
                return (
                  <button
                    key={entry.id}
                    type="button"
                    onClick={() => setLevel(entry.id)}
                    className={`cursor-pointer rounded-full border p-[6px_12px] text-[12.5px] whitespace-nowrap ${
                      on
                        ? "border-od-stroke bg-od-raise-10 text-od-text"
                        : "border-od-border-7 text-od-muted-4 bg-transparent"
                    }`}
                  >
                    {t[entry.label]}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Machine output: never translated, always left to right. */}
          <div
            dir="ltr"
            className="border-od-line bg-od-canvas-2 overflow-hidden rounded-[10px] border"
          >
            {logLines.map((line, index) => (
              <div
                key={line.time}
                className={`flex flex-wrap items-start gap-x-[14px] gap-y-[6px] p-[9px_14px] ${
                  index === 0 ? "" : "border-t border-[color:var(--od-raise-6)]"
                }`}
              >
                <span className="mono ltr-data text-od-faint-2 flex-none text-[11.5px]">
                  {line.time}
                </span>
                <span
                  className="mono ltr-data w-[52px] flex-none text-[11px] font-semibold uppercase"
                  style={{
                    color:
                      line.level === "error"
                        ? "var(--od-red-text-4)"
                        : line.level === "warn"
                          ? "var(--od-amber-text)"
                          : "var(--od-faint-2)",
                  }}
                >
                  {line.level}
                </span>
                <span className="mono ltr-data text-od-faint w-[92px] flex-none text-[11.5px]">
                  {line.service}
                </span>
                <span className="mono ltr-data text-od-text-2 min-w-[200px] flex-[1_1_240px] text-[12px] [overflow-wrap:anywhere]">
                  {line.message}
                </span>
              </div>
            ))}
          </div>

          {/* A diagnostics bundle is shared with strangers, so what it excludes is stated. */}
          <div className="border-od-line bg-od-panel-deep-2 text-od-muted mt-[14px] rounded-[9px] border p-[13px_15px] text-[12.5px] text-pretty">
            {t.bundle_note}
          </div>
        </section>
      </div>
    </div>
  );
}
