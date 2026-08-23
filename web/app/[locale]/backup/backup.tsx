"use client";

import { useState } from "react";

import { Sidebar } from "@/components/shell/sidebar";
import { StatePreview, type ScreenState } from "@/components/state-preview";
import { interpolate } from "@/lib/i18n";
import type { Locale } from "@/lib/locales";

import type { BackupDictionary } from "./page";

type Key = keyof BackupDictionary;
type TargetId = "nas" | "s3" | "usb" | "none";

const TARGETS: Record<TargetId, { label: Key; body: Key; path: string; note: Key }> = {
  nas: {
    label: "target_nas",
    body: "target_nas_body",
    path: "smb://nas.wagner-partner.local/telagent",
    note: "target_nas_note",
  },
  s3: {
    label: "target_s3",
    body: "target_s3_body",
    path: "s3://wagner-partner-backup/telagent",
    note: "target_s3_note",
  },
  usb: {
    label: "target_usb",
    body: "target_usb_body",
    path: "/mnt/backup-usb/telagent",
    note: "target_usb_note",
  },
  // The "nowhere" target has no path of its own, so its placeholder is copy too.
  none: {
    label: "target_none",
    body: "target_none_body",
    path: "",
    note: "target_none_note",
  },
};

const PARTS: { id: string; label: Key; size: string; note: Key; locked: boolean }[] = [
  { id: "config", label: "part_config", size: "180 KB", note: "part_config_note", locked: true },
  { id: "db", label: "part_db", size: "312 MB", note: "part_db_note", locked: true },
  {
    id: "transcripts",
    label: "part_transcripts",
    size: "290 MB",
    note: "part_transcripts_note",
    locked: false,
  },
  {
    id: "recordings",
    label: "part_recordings",
    size: "18.4 GB",
    note: "part_recordings_note",
    locked: false,
  },
  { id: "models", label: "part_models", size: "6.7 GB", note: "part_models_note", locked: false },
];

const SNAPSHOTS: {
  dayKey?: Key;
  day?: string;
  time: string;
  size: string;
  ok: boolean;
  tag?: Key;
  tagVersion?: string;
  note: Key;
}[] = [
  { dayKey: "when_today", time: "03:00", size: "1.4 GB", ok: true, note: "snapshot_nightly" },
  { dayKey: "when_yesterday", time: "03:00", size: "1.4 GB", ok: true, note: "snapshot_nightly" },
  {
    day: "18 Aug",
    time: "14:22",
    size: "1.4 GB",
    ok: true,
    tag: "snapshot_before_update_tag",
    tagVersion: "1.4.2",
    note: "snapshot_before_update",
  },
  { day: "18 Aug", time: "03:00", size: "1.3 GB", ok: false, note: "snapshot_failed" },
  { day: "17 Aug", time: "03:00", size: "1.3 GB", ok: true, note: "snapshot_nightly" },
  {
    day: "11 Aug",
    time: "03:00",
    size: "1.2 GB",
    ok: true,
    tag: "snapshot_weekly_tag",
    note: "snapshot_weekly",
  },
];

const RESTORE_FACTS: Key[] = [
  "restore_fact_data",
  "restore_fact_line",
  "restore_fact_settings",
];

/** Sizes are written the way a person reads them, so the total is summed back from the text. */
function toMegabytes(size: string): number {
  const value = parseFloat(size);
  if (size.includes("GB")) return value * 1000;
  if (size.includes("KB")) return value / 1000;
  return value;
}

export function Backup({ locale, t }: { locale: Locale; t: BackupDictionary }) {
  const [state, setState] = useState<ScreenState>("default");
  const [target, setTarget] = useState<TargetId>("nas");
  const [parts, setParts] = useState<string[]>(["config", "db", "transcripts", "recordings"]);
  const [restore, setRestore] = useState<string | null>(null);

  const running = state === "running";
  const stale = state === "stale";
  const none = state === "none";
  const active: TargetId = none ? "none" : target;
  const chosen = TARGETS[active];

  const severity = none ? "red" : stale ? "amber" : "ok";
  const verdict = none
    ? { title: t.verdict_none_title, body: t.verdict_none_body, action: t.verdict_none_action }
    : stale
      ? { title: t.verdict_stale_title, body: t.verdict_stale_body, action: t.verdict_stale_action }
      : { title: t.verdict_ok_title, body: t.verdict_ok_body, action: null };

  const totalMb = PARTS.filter((part) => part.locked || parts.includes(part.id)).reduce(
    (sum, part) => sum + toMegabytes(part.size),
    0,
  );
  const totalSize =
    totalMb >= 1000 ? `${(totalMb / 1000).toFixed(1)} GB` : `${Math.round(totalMb)} MB`;

  return (
    <div className="bg-od-canvas text-od-text-2 min-h-dvh text-[14px] leading-[1.45] ps-[224px]">
      <div className="fixed inset-y-0 start-0 z-50 h-dvh w-[224px]">
        <Sidebar locale={locale} active="settings" liveCalls={0} />
      </div>

      <StatePreview
        state={state}
        onChange={setState}
        states={["default", "running", "stale", "none"]}
        labels={{ default: "Healthy", running: "Running", stale: "Stale", none: "No backup" }}
      />

      <div className="mx-auto max-w-[1000px] p-[26px_28px_80px]">
        <div className="flex flex-wrap items-start justify-between gap-x-5 gap-y-[14px]">
          <div className="min-w-0 max-w-[64ch] flex-[1_1_320px]">
            <h1 className="text-od-text m-0 text-[26px] font-semibold tracking-[-0.02em]">
              {t.title}
            </h1>
            {/* Said plainly, because a self-hoster is the only one who can act on it. */}
            <p className="text-od-muted-4 mt-[6px] text-pretty">{t.intro}</p>
          </div>
          <button
            type="button"
            onClick={() => setState("running")}
            className="border-od-stroke bg-od-raise-10 text-od-text-2 hover:bg-od-border-3 flex-none cursor-pointer rounded-[7px] border p-[9px_15px] text-[13px] font-semibold whitespace-nowrap"
          >
            {t.run_now}
          </button>
        </div>

        <div
          className="mt-5 flex flex-wrap items-start gap-x-4 gap-y-3 rounded-[11px] border p-[15px_17px]"
          style={{
            borderColor:
              severity === "red"
                ? "var(--od-red-border-3)"
                : severity === "amber"
                  ? "var(--od-amber-border-2)"
                  : "var(--od-line)",
            background:
              severity === "red"
                ? "var(--od-red-bg-4)"
                : severity === "amber"
                  ? "var(--od-amber-bg-2)"
                  : "var(--od-panel-deep-2)",
          }}
        >
          <span
            className="mt-[5px] size-[11px] flex-none rounded-full"
            style={{
              background:
                severity === "red"
                  ? "#F0605E"
                  : severity === "amber"
                    ? "var(--od-amber)"
                    : "var(--od-green)",
              animation: severity === "red" ? "od-ring 1.6s ease-out infinite" : "none",
            }}
          />
          <div className="min-w-[240px] flex-[1_1_320px]">
            <div
              className="text-[16px] font-semibold"
              style={{
                color:
                  severity === "red"
                    ? "var(--od-red-text-3)"
                    : severity === "amber"
                      ? "var(--od-amber-text-2)"
                      : "var(--od-text)",
              }}
            >
              {verdict.title}
            </div>
            <div
              className="mt-1 max-w-[70ch] text-[13px] text-pretty"
              style={{
                color:
                  severity === "red"
                    ? "var(--od-red-text-6)"
                    : severity === "amber"
                      ? "var(--od-amber-text-3)"
                      : "var(--od-muted)",
              }}
            >
              {verdict.body}
            </div>
          </div>
          {verdict.action ? (
            <button
              type="button"
              className="flex-none cursor-pointer rounded-[7px] border p-[8px_14px] text-[13px] font-medium whitespace-nowrap"
              style={{
                borderColor:
                  severity === "red" ? "var(--od-red-border-2)" : "var(--od-amber-border)",
                background: severity === "red" ? "var(--od-red-bg-2)" : "var(--od-amber-bg)",
                color: severity === "red" ? "var(--od-red-text-3)" : "var(--od-amber-text-2)",
              }}
            >
              {verdict.action}
            </button>
          ) : null}
        </div>

        {running ? (
          <div className="mt-4 rounded-[10px] border border-[color:var(--od-violet-border)] bg-[rgba(139,124,255,.06)] p-[15px_17px]">
            <div className="flex flex-wrap items-center gap-x-[14px] gap-y-[10px]">
              <span
                className="inline-flex size-5 flex-none items-center justify-center rounded-full border border-[color:var(--od-violet-border)] text-[11px] text-[color:var(--od-violet-3)]"
                style={{ animation: "od-spin 1.1s linear infinite" }}
              >
                ◐
              </span>
              <span className="text-od-text min-w-0 flex-[1_1_240px] font-semibold">
                {t.running_title}
              </span>
              <span className="text-od-muted-4 flex-none text-[12px]">{t.running_left}</span>
            </div>
            <div className="bg-od-raise-4 mt-3 h-1 rounded-full">
              <span className="block h-1 w-[78%] rounded-full bg-[color:var(--od-violet)]" />
            </div>
            {/* A snapshot read, so answering the phone during a backup is safe. */}
            <div className="text-od-muted-5 mt-[10px] text-[12.5px] text-pretty">
              {t.running_note}
            </div>
          </div>
        ) : null}

        <section className="mt-[22px] flex flex-wrap items-start gap-4">
          <div className="border-od-line bg-od-panel-deep-3 min-w-[min(100%,300px)] flex-[1_1_320px] rounded-[10px] border p-[18px]">
            <h2 className="text-od-muted-4 m-0 text-[13px] font-semibold tracking-[.07em] uppercase">
              {t.where_heading}
            </h2>
            <div className="mt-[13px] flex flex-col gap-[9px]">
              {(["nas", "s3", "usb"] as const).map((id) => {
                const on = active === id;
                return (
                  <button
                    key={id}
                    type="button"
                    onClick={() => {
                      setTarget(id);
                      setState("default");
                    }}
                    className="block w-full cursor-pointer rounded-[9px] border p-[13px_14px] text-start"
                    style={{
                      borderColor: on ? "var(--od-stroke)" : "var(--od-line)",
                      background: on ? "var(--od-raise-10)" : "var(--od-panel-deep-2)",
                    }}
                  >
                    <span className="flex items-start gap-[11px]">
                      <span
                        className="mt-[3px] size-[15px] flex-none rounded-full border"
                        style={{
                          borderColor: on ? "var(--od-violet)" : "var(--od-stroke-5)",
                          background: on ? "var(--od-violet)" : "transparent",
                          boxShadow: on ? "inset 0 0 0 3px var(--od-panel-deep-3)" : "none",
                        }}
                      />
                      <span className="min-w-0">
                        <span className="flex flex-wrap items-center gap-2">
                          <span className="text-od-text font-semibold">
                            {t[TARGETS[id].label]}
                          </span>
                          {on ? (
                            <span className="border-od-green-border rounded-[5px] border bg-[rgba(63,185,132,.10)] p-[2px_8px] text-[10.5px] font-semibold whitespace-nowrap text-[color:var(--od-green-text)]">
                              {t.in_use}
                            </span>
                          ) : null}
                        </span>
                        <span className="text-od-muted-5 mt-[3px] block text-[12.5px] text-pretty">
                          {t[TARGETS[id].body]}
                        </span>
                      </span>
                    </span>
                  </button>
                );
              })}
            </div>
            {chosen.path ? (
              <div
                dir="ltr"
                className="border-od-border-6 bg-od-canvas-2 mono text-od-text-2 mt-[13px] rounded-lg border p-[11px_13px] text-[12px] [overflow-wrap:anywhere]"
              >
                {chosen.path}
              </div>
            ) : (
              <div className="border-od-border-6 bg-od-canvas-2 text-od-faint mt-[13px] rounded-lg border p-[11px_13px] text-[12px]">
                {t.target_none_path}
              </div>
            )}
            <div className="text-od-faint mt-[10px] text-[12.5px] text-pretty">
              {t[chosen.note]}
            </div>
          </div>

          <div className="border-od-line bg-od-panel-deep-3 min-w-[min(100%,280px)] flex-[1_1_300px] rounded-[10px] border p-[18px]">
            <h2 className="text-od-muted-4 m-0 text-[13px] font-semibold tracking-[.07em] uppercase">
              {t.contents_heading}
            </h2>
            <div className="mt-[11px] flex flex-col gap-[2px]">
              {PARTS.map((part) => {
                const on = part.locked || parts.includes(part.id);
                return (
                  <button
                    key={part.id}
                    type="button"
                    disabled={part.locked}
                    onClick={() =>
                      setParts((current) =>
                        current.includes(part.id)
                          ? current.filter((entry) => entry !== part.id)
                          : [...current, part.id],
                      )
                    }
                    className={`flex items-start gap-[11px] rounded-[7px] border-none bg-transparent p-[10px_11px] text-start ${
                      part.locked ? "cursor-default" : "cursor-pointer"
                    }`}
                  >
                    <span
                      className="mt-[2px] inline-flex size-[17px] flex-none items-center justify-center rounded-[5px] border text-[11px] leading-none font-bold text-white"
                      style={{
                        borderColor: on ? "var(--od-violet)" : "var(--od-stroke-5)",
                        background: on
                          ? part.locked
                            ? "var(--od-stroke-5)"
                            : "var(--od-violet)"
                          : "transparent",
                      }}
                    >
                      {on ? "✓" : ""}
                    </span>
                    <span className="min-w-0 flex-[1_1_auto] text-start">
                      <span className="text-od-text-3 block text-[13.5px]">{t[part.label]}</span>
                      <span className="text-od-faint mt-[2px] block text-[12px] text-pretty">
                        {t[part.note]}
                      </span>
                    </span>
                    <span
                      dir="ltr"
                      className="mono ltr-data text-od-faint-2 flex-none text-[11.5px]"
                    >
                      {part.size}
                    </span>
                  </button>
                );
              })}
            </div>
            <div className="border-od-border mt-[13px] flex flex-wrap items-baseline justify-between gap-x-4 gap-y-[10px] border-t pt-3">
              <span className="text-od-muted-5 max-w-[40ch] text-[12.5px] text-pretty">
                {parts.includes("recordings") ? t.schedule_with_audio : t.schedule_without_audio}
              </span>
              <span dir="ltr" className="mono ltr-data text-od-text-2 text-[13px] whitespace-nowrap">
                {totalSize}
              </span>
            </div>
          </div>
        </section>

        <section className="mt-[22px]">
          <div className="mb-3 flex flex-wrap items-baseline justify-between gap-x-4 gap-y-[10px]">
            <h2 className="text-od-muted-4 m-0 text-[13px] font-semibold tracking-[.07em] uppercase">
              {t.snapshots_heading}
            </h2>
            <span className="text-od-faint text-[12.5px] text-pretty">
              {t.snapshots_retention}
            </span>
          </div>
          <div className="border-od-line bg-od-panel-deep-3 overflow-hidden rounded-[10px] border">
            {SNAPSHOTS.map((snapshot, index) => {
              const tagKey = snapshot.tag ?? (snapshot.ok ? null : "snapshot_unverified_tag");
              const tag = tagKey
                ? snapshot.tagVersion
                  ? interpolate(t[tagKey], { version: snapshot.tagVersion })
                  : t[tagKey]
                : null;
              // The relative day is copy; the clock time is the same in every language.
              const day = snapshot.dayKey ? t[snapshot.dayKey] : snapshot.day;
              return (
                <div
                  key={`${snapshot.day ?? snapshot.dayKey}-${snapshot.time}`}
                  className="flex flex-wrap items-start gap-x-[14px] gap-y-[10px] p-[13px_16px]"
                  style={{
                    borderTop: index === 0 ? "none" : "1px solid var(--od-raise-6)",
                  }}
                >
                  <span
                    className="inline-flex size-[21px] flex-none items-center justify-center rounded-full border text-[11.5px] leading-none font-bold"
                    style={{
                      borderColor: snapshot.ok
                        ? "var(--od-green-border)"
                        : "var(--od-amber-border)",
                      background: snapshot.ok ? "rgba(63,185,132,.11)" : "var(--od-amber-bg)",
                      color: snapshot.ok ? "var(--od-green-text)" : "var(--od-amber-text)",
                    }}
                  >
                    {snapshot.ok ? "✓" : "!"}
                  </span>
                  <div className="min-w-[190px] flex-[1_1_220px]">
                    <div className="flex flex-wrap items-center gap-[9px]">
                      <span className="text-od-text-3 text-[13px]">
                        {day} <span className="mono ltr-data">{snapshot.time}</span>
                      </span>
                      {tag ? (
                        <span
                          className="rounded-[5px] border p-[2px_8px] text-[10.5px] font-semibold whitespace-nowrap"
                          style={{
                            borderColor: snapshot.ok
                              ? "var(--od-border-7)"
                              : "var(--od-amber-border)",
                            background: snapshot.ok ? "var(--od-raise-5)" : "var(--od-amber-bg)",
                            color: snapshot.ok ? "var(--od-muted-5)" : "var(--od-amber-text)",
                          }}
                        >
                          {tag}
                        </span>
                      ) : null}
                    </div>
                    <div className="text-od-muted-5 mt-[3px] text-[12.5px] text-pretty">
                      {t[snapshot.note]}
                    </div>
                  </div>
                  <span
                    dir="ltr"
                    className="mono ltr-data text-od-faint flex-none text-[12px] whitespace-nowrap"
                  >
                    {snapshot.size}
                  </span>
                  <div className="flex flex-none flex-wrap gap-[7px]">
                    <button
                      type="button"
                      onClick={() => setRestore(`${day} ${snapshot.time}`)}
                      className="cursor-pointer rounded-md border bg-transparent p-[7px_11px] text-[12.5px] whitespace-nowrap"
                      style={{
                        borderColor: snapshot.ok
                          ? "var(--od-border-7)"
                          : "var(--od-amber-border)",
                        color: snapshot.ok ? "var(--od-text-3)" : "var(--od-amber-text)",
                      }}
                    >
                      {t.restore}
                    </button>
                    <button
                      type="button"
                      className="border-od-border-7 text-od-muted hover:text-od-text-2 hover:bg-od-raise-4 cursor-pointer rounded-md border bg-transparent p-[7px_11px] text-[12.5px] whitespace-nowrap"
                    >
                      {t.download}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      </div>

      {restore ? (
        <RestoreDialog when={restore} t={t} onClose={() => setRestore(null)} />
      ) : null}
    </div>
  );
}

function RestoreDialog({
  when,
  t,
  onClose,
}: {
  when: string;
  t: BackupDictionary;
  onClose: () => void;
}) {
  // The heading embeds the snapshot's own label, which is already in page direction.
  const [before, after] = t.restore_title.split("{when}");
  return (
    <div
      className="fixed inset-0 z-[70] flex items-start justify-center overflow-auto p-[60px_24px]"
      style={{ background: "var(--od-scrim-3)" }}
    >
      <div className="border-od-red-border-3 bg-od-panel w-full max-w-[560px] rounded-xl border">
        <div className="border-od-line border-b p-[20px_22px]">
          <h2 className="m-0 text-[19px] font-semibold text-[color:var(--od-red-text-3)]">
            {before}
            <span className="mono">{when}</span>
            {after}
          </h2>
          {/* The only destructive action on this screen, named as such. */}
          <p className="text-od-muted mt-2 max-w-[52ch] text-pretty">{t.restore_body}</p>
        </div>
        <div className="flex flex-col gap-3 p-[18px_22px]">
          {RESTORE_FACTS.map((fact) => (
            <div key={fact} className="flex items-start gap-[10px]">
              <span className="mt-[7px] size-[6px] flex-none rounded-full bg-[color:var(--od-red-text-4)]" />
              <span className="min-w-0 flex-[1_1_auto] text-[13px] text-pretty text-[color:var(--od-red-text-6)]">
                {t[fact]}
              </span>
            </div>
          ))}
          <div className="border-od-border-6 bg-od-canvas-2 mt-1 rounded-lg border p-[12px_14px]">
            <div className="text-od-muted-5 text-[12.5px]">{t.restore_confirm_label}</div>
            <div className="border-od-stroke-4 mono text-od-faint-2 mt-[7px] rounded-[7px] border border-dashed p-[9px_11px] text-[13px]">
              {when}
            </div>
          </div>
        </div>
        <div className="border-od-line flex flex-wrap justify-end gap-[10px] border-t p-[16px_22px]">
          <button
            type="button"
            onClick={onClose}
            className="border-od-border-2 text-od-muted hover:text-od-text-2 cursor-pointer rounded-[7px] border bg-transparent p-[9px_15px] whitespace-nowrap"
          >
            {t.cancel}
          </button>
          <button
            type="button"
            onClick={onClose}
            className="border-od-red-border-2 bg-od-red-bg-2 cursor-pointer rounded-[7px] border p-[9px_16px] font-semibold whitespace-nowrap text-[color:var(--od-red-text-3)]"
          >
            {t.restore_submit}
          </button>
        </div>
      </div>
    </div>
  );
}
