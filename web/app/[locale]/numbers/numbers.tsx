"use client";

import { useState } from "react";

import { Sidebar } from "@/components/shell/sidebar";
import { StatePreview, type ScreenState } from "@/components/state-preview";
import {
  DEVICES,
  DIRECTIONS,
  NUMBERS,
  PHONE_KINDS,
  PROVIDERS,
  type Direction,
} from "@/lib/numbers/data";
import { interpolate } from "@/lib/i18n";
import { EXTERNAL } from "@/lib/links";
import type { Locale } from "@/lib/locales";

import type { NumbersDictionary } from "./page";

type Key = keyof NumbersDictionary;

const NUMBER_COLUMNS = "minmax(0,1.3fr) 108px minmax(0,1.4fr) minmax(0,.9fr) 40px";
const DEVICE_COLUMNS = "minmax(0,1.6fr) minmax(0,1.1fr) 90px 76px";

const DIRECTION_FILTERS: [Direction | "all" | "pending", Key][] = [
  ["all", "filter_all"],
  ["in", "dir_in"],
  ["out", "dir_out"],
  ["whatsapp", "whatsapp_name"],
  ["pending", "being_set_up"],
];

const ROW_MENU: Key[] = ["column_answers", "number_settings", "test_call", "release_number"];

export function Numbers({ locale, t }: { locale: Locale; t: NumbersDictionary }) {
  const [state, setState] = useState<ScreenState>("default");
  const [scope, setScope] = useState<"numbers" | "phones">("numbers");
  const [direction, setDirection] = useState<Direction | "all" | "pending">("all");
  const [query, setQuery] = useState("");
  const [rowMenu, setRowMenu] = useState<string | null>(null);
  const [phoneOpen, setPhoneOpen] = useState(false);
  const [sipOpen, setSipOpen] = useState(false);

  const offline = state === "offline";
  const empty = state === "empty";
  const phones = scope === "phones";
  const showBody = state === "default" || empty || offline;

  const trimmed = query.trim().toLowerCase();
  const shown = NUMBERS.filter((entry) => {
    const matchesDirection =
      direction === "all"
        ? true
        : direction === "pending"
          ? Boolean(entry.pending)
          : entry.dir.includes(direction) && !entry.pending;
    const matchesQuery =
      !trimmed || `${entry.number} ${t[entry.label]}`.toLowerCase().includes(trimmed);
    return matchesDirection && matchesQuery;
  });

  const countLine = phones
    ? interpolate(t.count_phones, {
        total: DEVICES.length,
        registered: DEVICES.filter((device) => device.ok).length,
      })
    : interpolate(t.count_numbers, {
        total: NUMBERS.length,
        answered: NUMBERS.filter((entry) => entry.dir.includes("in") && !entry.pending).length,
        pending: NUMBERS.filter((entry) => entry.pending).length,
      });

  return (
    <div className="bg-od-canvas text-od-text-2 min-h-dvh text-[14px] leading-[1.45] ps-[224px]">
      <div className="fixed inset-y-0 start-0 z-50 h-dvh w-[224px]">
        <Sidebar locale={locale} active="numbers" />
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
              {t.offline_forward}
            </button>
          </div>
        </div>
      ) : null}

      <div className="mx-auto max-w-[1400px] p-[22px_28px_60px]">
        {state === "error" ? <ProviderRefused t={t} onFix={() => setSipOpen(true)} /> : null}

        {state === "loading" ? (
          <div className="flex flex-col gap-3">
            {[0, 1, 2, 3, 4].map((index) => (
              <div
                key={index}
                className="border-od-raise-12 h-14 rounded-[10px] border"
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
                <p className="text-od-muted-4 mt-[6px] text-pretty">{countLine}</p>
              </div>
              <button
                type="button"
                onClick={() => (phones ? setPhoneOpen(true) : setSipOpen(true))}
                className="border-od-stroke bg-od-raise-10 text-od-text-2 hover:bg-od-border-3 flex-none cursor-pointer rounded-[7px] border p-[9px_15px] font-medium"
              >
                {phones ? t.add_phone : t.add_number}
              </button>
            </div>

            <div className="border-od-border mt-[18px] flex flex-wrap gap-1 border-b pb-[2px]">
              {(
                [
                  ["numbers", "tab_numbers", NUMBERS.length],
                  ["phones", "tab_phones", DEVICES.length],
                ] as const
              ).map(([id, label, count]) => {
                const on = scope === id;
                return (
                  <button
                    key={id}
                    type="button"
                    onClick={() => {
                      setScope(id);
                      setRowMenu(null);
                    }}
                    className="inline-flex cursor-pointer items-center gap-2 border-none bg-transparent p-[9px_14px] text-[13.5px]"
                    style={{
                      borderBottom: `2px solid ${on ? "var(--od-violet)" : "transparent"}`,
                      color: on ? "var(--od-text)" : "var(--od-muted)",
                      fontWeight: on ? 600 : 400,
                    }}
                  >
                    <span>{t[label]}</span>
                    <span
                      dir="ltr"
                      className="rounded-full p-[1px_7px] text-[11.5px]"
                      style={{
                        background: on ? "rgba(139,124,255,.14)" : "var(--od-raise-5)",
                        color: on ? "var(--od-violet-3)" : "var(--od-faint)",
                      }}
                    >
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>

            {phones ? <PhonesTab t={t} /> : null}

            {!phones && empty ? (
              <div className="border-od-border-6 bg-od-panel-deep-2 mt-[18px] rounded-[10px] border border-dashed p-[40px_28px]">
                <h3 className="m-0 text-[18px] font-semibold">{t.empty_title}</h3>
                <p className="text-od-muted mt-[10px] max-w-[62ch] text-pretty">{t.empty_body}</p>
                <button
                  type="button"
                  onClick={() => setSipOpen(true)}
                  className="border-od-stroke bg-od-raise-10 text-od-text-2 hover:bg-od-border-3 mt-4 cursor-pointer rounded-[7px] border p-[9px_16px] font-medium"
                >
                  {t.add_number}
                </button>
              </div>
            ) : null}

            {!phones && !empty ? (
              <div>
                <div className="mt-5 flex flex-wrap items-center gap-[10px]">
                  <div className="border-od-border-6 bg-od-panel-deep-3 flex min-w-[200px] flex-[1_1_260px] items-center gap-[9px] rounded-lg border p-[9px_13px]">
                    <span className="text-od-faint text-[15px]">⌕</span>
                    <input
                      value={query}
                      onChange={(event) => setQuery(event.target.value)}
                      placeholder={t.search_placeholder}
                      className="text-od-text-2 min-w-0 flex-1 border-none bg-transparent text-[14px] outline-none"
                    />
                  </div>
                  {DIRECTION_FILTERS.map(([id, label]) => {
                    const on = direction === id;
                    const count =
                      id === "all"
                        ? NUMBERS.length
                        : id === "pending"
                          ? NUMBERS.filter((entry) => entry.pending).length
                          : NUMBERS.filter(
                              (entry) => entry.dir.includes(id as Direction) && !entry.pending,
                            ).length;
                    return (
                      <button
                        key={id}
                        type="button"
                        onClick={() => setDirection(id)}
                        className={`inline-flex cursor-pointer items-center gap-2 rounded-full border p-[7px_13px] text-[13px] whitespace-nowrap ${
                          on
                            ? "border-od-stroke bg-od-raise-10 text-od-text"
                            : "border-od-border-7 text-od-muted-4 bg-transparent"
                        }`}
                      >
                        <span>{t[label]}</span>
                        <span
                          dir="ltr"
                          className="mono ltr-data text-[11.5px]"
                          style={{ color: on ? "var(--od-muted-4)" : "var(--od-faint-2)" }}
                        >
                          {count}
                        </span>
                      </button>
                    );
                  })}
                </div>

                {shown.length === 0 ? (
                  <NoMatch
                    t={t}
                    query={query.trim()}
                    direction={direction}
                    onClear={() => {
                      setDirection("all");
                      setQuery("");
                    }}
                  />
                ) : (
                  <div className="border-od-line bg-od-panel-deep-3 mt-[14px] overflow-x-auto overflow-y-hidden rounded-[10px] border">
                    <div
                      className="border-od-line bg-od-canvas-2 text-od-faint grid gap-4 border-b p-[11px_18px] text-[11px] tracking-[.08em] uppercase"
                      style={{ gridTemplateColumns: NUMBER_COLUMNS }}
                    >
                      <span>{t.column_number}</span>
                      <span>{t.column_answers}</span>
                      <span>{t.column_assistant}</span>
                      <span>{t.column_month}</span>
                      <span />
                    </div>

                    {shown.map((entry) => {
                      const down = offline && entry.main;
                      const menuKey = `${entry.number}-${entry.dir.join("")}`;
                      return (
                        <div
                          key={menuKey}
                          className="hover:bg-od-raise grid items-start gap-4 border-b border-[color:var(--od-raise-6)] p-[13px_18px]"
                          style={{
                            gridTemplateColumns: NUMBER_COLUMNS,
                            background: down ? "var(--od-red-bg-6)" : "transparent",
                          }}
                        >
                          <div className="min-w-0">
                            <div className="flex flex-wrap items-center gap-2">
                              <span className="mono ltr-data text-od-text text-[14.5px] font-medium">
                                {entry.number}
                              </span>
                              {down ? (
                                <span className="border-od-red-border-3 rounded-[5px] border bg-[rgba(240,96,94,.10)] p-[2px_9px] text-[11.5px] font-semibold whitespace-nowrap text-[color:var(--od-red-text-4)]">
                                  {t.not_registered}
                                </span>
                              ) : null}
                              {entry.pending ? (
                                <span className="border-od-amber-border-2 bg-od-amber-bg rounded-[5px] border p-[2px_9px] text-[11.5px] font-semibold whitespace-nowrap text-[color:var(--od-amber-text)]">
                                  {entry.pending === "carrier" ? t.waiting_carrier : t.verifying}
                                </span>
                              ) : null}
                            </div>
                            <div className="text-od-muted-5 mt-[3px] text-[12.5px] text-pretty">
                              {t[entry.label]}
                            </div>
                          </div>

                          <div className="flex items-center gap-[7px]">
                            {entry.dir.map((id) => {
                              const tone = DIRECTIONS[id];
                              return (
                                <span
                                  key={id}
                                  title={t[tone.label]}
                                  className="inline-flex size-[26px] flex-none items-center justify-center rounded-[7px] border text-[13px] leading-none"
                                  style={{
                                    borderColor: tone.border,
                                    background: tone.background,
                                    color: tone.color,
                                  }}
                                >
                                  {tone.icon}
                                </span>
                              );
                            })}
                          </div>

                          <div className="min-w-0">
                            <span
                              className="inline-flex items-center gap-[7px] rounded-md p-[4px_11px] text-[13px] font-medium whitespace-nowrap"
                              style={
                                entry.pending
                                  ? {
                                      border: "1px dashed var(--od-border-11)",
                                      background: "transparent",
                                      color: "var(--od-faint)",
                                    }
                                  : {
                                      border: `1px solid ${entry.type === "agent" ? "var(--od-violet-border)" : "var(--od-green-border)"}`,
                                      background:
                                        entry.type === "agent"
                                          ? "rgba(139,124,255,.13)"
                                          : "rgba(63,185,132,.11)",
                                      color:
                                        entry.type === "agent"
                                          ? "var(--od-violet-3)"
                                          : "var(--od-green-text)",
                                    }
                              }
                            >
                              {entry.answeredBy ?? (entry.answeredByKey ? t[entry.answeredByKey] : "")}
                            </span>
                            <div className="text-od-faint mt-1 text-[12px] text-pretty">
                              {t[entry.fallback]}
                            </div>
                          </div>

                          <div className="text-od-muted text-[13px]">
                            {entry.volumeUnit === "none"
                              ? t.none
                              : interpolate(
                                  entry.volumeUnit === "calls" ? t.calls_count : t.chats_count,
                                  { count: entry.volume },
                                )}
                          </div>

                          <div className="relative">
                            <button
                              type="button"
                              onClick={() => setRowMenu(rowMenu === menuKey ? null : menuKey)}
                              aria-label={t.more_actions}
                              className="text-od-faint-2 hover:text-od-text-3 inline-flex size-7 cursor-pointer items-center justify-center rounded-[7px] border-none bg-transparent text-[15px] leading-none hover:bg-[var(--od-raise-5)]"
                            >
                              ⋯
                            </button>
                            {rowMenu === menuKey ? (
                              <div
                                className="border-od-border-9 bg-od-panel absolute top-8 end-0 z-30 w-[200px] rounded-[9px] border p-[5px]"
                                style={{ boxShadow: "0 14px 34px var(--od-scrim-3)" }}
                              >
                                {ROW_MENU.map((label) => (
                                    <button
                                      key={label}
                                      type="button"
                                      className="hover:bg-od-raise block w-full cursor-pointer rounded-[7px] border-none bg-transparent p-[8px_10px] text-start text-[13px]"
                                      style={{
                                        color:
                                          label === "release_number"
                                            ? "var(--od-red-text-4)"
                                            : "var(--od-text-3)",
                                      }}
                                    >
                                      {t[label]}
                                    </button>
                                ))}
                              </div>
                            ) : null}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}

                <div className="border-od-line bg-od-panel-deep-2 mt-5 flex flex-wrap items-center justify-between gap-x-5 gap-y-3 rounded-[10px] border p-[14px_16px]">
                  <div className="max-w-[72ch] min-w-0">
                    <div className="text-od-text-5 font-medium">
                      {t.porting_title}
                    </div>
                    <div className="text-od-muted-5 mt-[3px] text-[13px] text-pretty">
                      {t.porting_body}
                    </div>
                  </div>
                  <a
                    href={EXTERNAL.docs}
                    target="_blank"
                    rel="noreferrer"
                    className="text-od-violet text-[13px] hover:underline"
                  >
                    {t.porting_how}
                  </a>
                </div>
              </div>
            ) : null}
          </div>
        ) : null}
      </div>

      {phoneOpen ? <AddPhoneDialog t={t} onClose={() => setPhoneOpen(false)} /> : null}
      {sipOpen ? <AddNumberDialog t={t} onClose={() => setSipOpen(false)} /> : null}
    </div>
  );
}

function PhonesTab({ t }: { t: NumbersDictionary }) {
  return (
    <div>
      <div className="border-od-green-border mt-[18px] flex flex-wrap items-start gap-x-5 gap-y-[14px] rounded-[10px] border bg-[rgba(63,185,132,.05)] p-4">
        <span className="border-od-border-9 text-od-text-5 inline-flex size-[38px] flex-none items-center justify-center rounded-lg border bg-[var(--od-raise-5)] font-semibold">
          eb
        </span>
        <div className="min-w-[220px] flex-[1_1_240px]">
          <div className="flex flex-wrap items-center gap-[10px]">
            <span className="text-od-text text-[15.5px] font-semibold">easybell</span>
            <span className="border-od-green-border rounded-[5px] border bg-[rgba(63,185,132,.11)] p-[2px_9px] text-[11.5px] font-semibold text-[color:var(--od-green-text)]">
              {t.registered}
            </span>
          </div>
          <div className="mono ltr-data text-od-muted-2 mt-[5px] text-[12.5px] [overflow-wrap:anywhere]">
            sip.easybell.de · +43 1 987 6543
          </div>
          <div className="text-od-muted-5 mt-[6px] text-[13px] text-pretty">
            {t.phones_note}
          </div>
        </div>
        <button
          type="button"
          className="border-od-stroke bg-od-raise-10 text-od-text-2 hover:bg-od-border-3 flex-none cursor-pointer rounded-[7px] border p-[8px_13px] text-[13px] font-medium"
        >
          {t.test_registration}
        </button>
      </div>

      <div className="border-od-line bg-od-panel-deep-3 mt-[14px] overflow-hidden rounded-[10px] border">
        <div
          className="border-od-line bg-od-canvas-2 text-od-faint grid gap-4 border-b p-[11px_18px] text-[11px] tracking-[.08em] uppercase"
          style={{ gridTemplateColumns: DEVICE_COLUMNS }}
        >
          <span>{t.column_phone}</span>
          <span>{t.column_where}</span>
          <span>{t.column_extension}</span>
          <span />
        </div>

        {DEVICES.map((device) => (
          <div
            key={device.ext}
            className="hover:bg-od-raise grid items-center gap-4 border-b border-[color:var(--od-raise-6)] p-[13px_18px]"
            style={{ gridTemplateColumns: DEVICE_COLUMNS }}
          >
            <div className="flex min-w-0 items-center gap-[11px]">
              <span className="border-od-border-9 text-od-text-5 inline-flex size-[34px] flex-none items-center justify-center rounded-lg border bg-[var(--od-raise-5)] text-[14px]">
                {device.mark}
              </span>
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-[9px]">
                  <span className="text-od-text font-medium text-pretty">
                    {device.name ?? (device.nameKey ? t[device.nameKey] : "")}
                  </span>
                  <span
                    className="rounded-[5px] border p-[2px_9px] text-[11.5px] font-semibold whitespace-nowrap"
                    style={{
                      borderColor: device.ok ? "var(--od-green-border)" : "var(--od-amber-border)",
                      background: device.ok ? "rgba(63,185,132,.10)" : "var(--od-amber-bg)",
                      color: device.ok ? "var(--od-green-text)" : "var(--od-amber-text)",
                    }}
                  >
                    {device.ok ? t.registered : t.not_reachable}
                  </span>
                </div>
                <div className="text-od-faint mt-[3px] text-[12.5px] text-pretty">
                  {t[device.detail]}
                </div>
              </div>
            </div>
            <div className="text-od-muted-5 min-w-0 text-[13px] text-pretty">
              {device.where ?? (device.whereKey ? t[device.whereKey] : "")}
            </div>
            <span className="mono ltr-data text-od-muted text-[13px]">{device.ext}</span>
            <button
              type="button"
              className="border-od-border-7 text-od-muted hover:text-od-text-2 cursor-pointer justify-self-end rounded-md border bg-transparent p-[7px_12px] text-[13px] hover:bg-[var(--od-raise-4)]"
            >
              {t.edit}
            </button>
          </div>
        ))}

        <div className="text-od-faint max-w-[72ch] p-[14px_18px] text-[12.5px] text-pretty">
          {t.provision_note}
        </div>
      </div>
    </div>
  );
}

function NoMatch({
  t,
  query,
  direction,
  onClear,
}: {
  t: NumbersDictionary;
  query: string;
  direction: Direction | "all" | "pending";
  onClear: () => void;
}) {
  const filterLabel = t[DIRECTION_FILTERS.find(([id]) => id === direction)![1]];

  const title = query
    ? interpolate(t.no_match, { query })
    : direction === "whatsapp"
      ? t.empty_no_wa
      : direction === "out"
        ? t.empty_no_out
        : t.empty_no_in;

  const body = query
    ? direction === "all"
      ? t.search_note
      : interpolate(t.search_note_filtered, { filter: filterLabel })
    : direction === "whatsapp"
      ? t.empty_no_wa_body
      : direction === "out"
        ? t.empty_no_out_body
        : t.empty_no_in_body;

  return (
    <div className="border-od-border-6 bg-od-panel-deep-2 mt-[14px] rounded-[10px] border border-dashed p-[28px_22px]">
      <div className="text-[15.5px] font-semibold">{title}</div>
      <div className="text-od-muted mt-[6px] max-w-[56ch] text-[13px] text-pretty">{body}</div>
      <button
        type="button"
        onClick={onClear}
        className="border-od-border-7 text-od-text-3 mt-[14px] cursor-pointer rounded-[7px] border bg-transparent p-[8px_14px] text-[13px] whitespace-nowrap hover:bg-[var(--od-raise-4)]"
      >
        {query ? t.clear_search : t.show_all}
      </button>
    </div>
  );
}

function AddPhoneDialog({ t, onClose }: { t: NumbersDictionary; onClose: () => void }) {
  const [kindId, setKindId] = useState("desk");
  const kind = PHONE_KINDS.find((entry) => entry.id === kindId) ?? PHONE_KINDS[0];

  return (
    <div
      className="fixed inset-0 z-[60] flex items-start justify-center overflow-auto p-[50px_24px]"
      style={{ background: "var(--od-scrim-3)" }}
    >
      <div className="border-od-border-9 bg-od-panel w-full max-w-[660px] rounded-xl border">
        <div className="border-od-line flex flex-wrap items-start justify-between gap-x-5 gap-y-3 border-b p-[20px_22px]">
          <div className="min-w-0">
            <h2 className="text-od-text m-0 text-[19px] font-semibold text-pretty">{t.add_phone}</h2>
            <p className="text-od-muted-4 mt-[6px] max-w-[56ch] text-pretty">{t.add_phone_note}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="border-od-border-7 text-od-muted hover:text-od-text-2 cursor-pointer rounded-md border bg-transparent p-[6px_10px] hover:bg-[var(--od-raise-6)]"
          >
            {t.close}
          </button>
        </div>

        <div className="flex flex-wrap gap-2 p-[16px_22px_0]">
          {PHONE_KINDS.map((entry) => {
            const on = kindId === entry.id;
            return (
              <button
                key={entry.id}
                type="button"
                onClick={() => setKindId(entry.id)}
                className="min-w-[min(100%,170px)] flex-[1_1_180px] cursor-pointer rounded-[9px] border p-[12px_14px] text-start"
                style={{
                  borderColor: on ? "var(--od-stroke)" : "var(--od-border-7)",
                  background: on ? "var(--od-raise-10)" : "var(--od-canvas-2)",
                }}
              >
                <span className="text-od-text-2 block font-semibold text-pretty">
                  {t[entry.label]}
                </span>
                <span className="text-od-muted-5 mt-[3px] block text-[12.5px] text-pretty">
                  {t[entry.note]}
                </span>
              </button>
            );
          })}
        </div>

        <div className="p-[18px_22px_22px]">
          <div className="flex flex-wrap items-start gap-5">
            <div className="min-w-[220px] flex-[1_1_240px]">
              <div className="text-od-text-3 font-medium">{t[kind.stepTitle]}</div>
              <div className="text-od-muted-2 mt-2 text-[13.5px] leading-[1.7] text-pretty">
                {t[kind.stepBody]}
              </div>

              <div className="mt-4 flex flex-col gap-3">
                <Readout label={t.column_extension} value={t.next_free} />
                <Readout label={t.name_it} value={t[kind.name]} />
                <Readout label={t.rings_when} value={t.rings_human} />
              </div>
            </div>

            <div className="border-od-stroke-3 bg-od-canvas-2 min-w-[min(100%,220px)] flex-[0_1_240px] rounded-[10px] border border-dashed p-[18px] text-center">
              <div className="text-od-faint text-[12px] tracking-[.07em] uppercase">
                {t[kind.pairTitle]}
              </div>
              <div
                className="border-od-border-6 mx-auto mt-[14px] size-[132px] rounded-lg border"
                style={{
                  background:
                    "repeating-conic-gradient(var(--od-raise-10) 0% 25%, var(--od-canvas-2) 0% 50%) 50% / 12px 12px",
                }}
              />
              <div className="mono ltr-data text-od-text-2 mt-3 text-[15px] tracking-[.12em]">
                4F2K-9QD1
              </div>
              {/* A pairing code is a credential for the whole line, so the risk is stated. */}
              <div className="text-od-faint mt-2 text-[12.5px] text-pretty">{t.code_valid}</div>
            </div>
          </div>

          <div className="border-od-line bg-od-panel-deep-2 mt-4 rounded-[9px] border p-[14px_16px]">
            <div className="text-od-text-5 text-[13px] font-medium">{t.manual_heading}</div>
            <div
              dir="ltr"
              className="mono ltr-data text-od-muted-2 mt-[10px] flex flex-wrap gap-x-[26px] gap-y-[10px] text-[12.5px]"
            >
              <span>server: telagent.wagner-partner.local</span>
              <span>user: ext13</span>
              <span>password: {t.manual_password_value}</span>
              <span>transport: TLS 5061</span>
            </div>
          </div>

          <div className="border-od-border mt-5 flex flex-wrap items-center justify-end gap-[10px] border-t pt-4">
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
              className="border-od-stroke bg-od-raise-10 text-od-text-2 cursor-pointer rounded-[7px] border p-[9px_16px] font-semibold"
            >
              {t.add_extension}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function Readout({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-od-muted-5 text-[12.5px]">{label}</div>
      <div className="border-od-border-6 bg-od-canvas-2 text-od-text-2 mt-[6px] rounded-[7px] border p-[10px_12px]">
        {value}
      </div>
    </div>
  );
}

/** Assistants are named people; the other choices are roles the interface names. */
type AnswerChoice = { id: string; name?: string; labelKey?: Key; kind: Key };

function AddNumberDialog({ t, onClose }: { t: NumbersDictionary; onClose: () => void }) {
  const [channel, setChannel] = useState<"voice" | "whatsapp">("voice");
  const [providerId, setProviderId] = useState("twilio");
  const [providerOpen, setProviderOpen] = useState(false);
  const [values, setValues] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState(false);
  const [fieldOpen, setFieldOpen] = useState<string | null>(null);
  const [answers, setAnswers] = useState<string[]>(["lena"]);
  const [answerOpen, setAnswerOpen] = useState(false);

  const inChannel = PROVIDERS.filter((entry) => entry.channel === channel);
  const provider =
    inChannel.find((entry) => entry.id === providerId) ??
    inChannel.find((entry) => entry.ready) ??
    inChannel[0];

  const blocked = provider.fields.some(
    (field) => field.required && (values[field.key] ?? "").trim().length < (field.min ?? 1),
  );

  const answerChoices: AnswerChoice[] =
    channel === "whatsapp"
      ? [
          { id: "lena", name: "Lena", kind: "kind_assistant" },
          { id: "anna", name: "Anna", kind: "kind_assistant" },
          { id: "person", labelKey: "person_in_channels", kind: "kind_unread" },
        ]
      : [
          { id: "lena", name: "Lena", kind: "kind_assistant" },
          { id: "anna", name: "Anna", kind: "kind_assistant" },
          { id: "reception", labelKey: "answered_reception", kind: "kind_handsets" },
          { id: "voicemail", labelKey: "answered_voicemail", kind: "kind_message" },
        ];

  const nameOf = (id: string) => {
    const choice = answerChoices.find((entry) => entry.id === id);
    return choice?.name ?? (choice?.labelKey ? t[choice.labelKey] : id);
  };

  /** The order matters: each name is tried for 20 seconds before the next. */
  const answerNote =
    channel === "whatsapp"
      ? answers.length === 0
        ? t.nobody_replies
        : answers.length === 1
          ? answers[0] === "person"
            ? t.messages_wait
            : interpolate(t.replies_every, { who: nameOf(answers[0]) })
          : interpolate(t.order_note_wa, {
              first: nameOf(answers[0]),
              rest: answers.slice(1).map(nameOf).join(t.list_join),
            })
      : answers.length === 0
        ? t.nobody_answers
        : answers.length === 1
          ? answers[0] === "reception"
            ? t.handset_only
            : answers[0] === "voicemail"
              ? t.voicemail_only
              : interpolate(t.answers_every_call, { who: nameOf(answers[0]) })
          : interpolate(t.order_note, { order: answers.map(nameOf).join(t.list_join) });

  return (
    <div
      className="fixed inset-0 z-[60] flex items-start justify-center overflow-auto p-[46px_24px]"
      style={{ background: "var(--od-scrim-3)" }}
    >
      <div className="border-od-border-9 bg-od-panel w-full max-w-[560px] overflow-hidden rounded-xl border">
        <div className="border-od-border flex items-start justify-between gap-4 border-b p-[20px_22px_14px]">
          <div className="max-w-[54ch] min-w-0">
            <h2 className="text-od-text m-0 text-[19px] font-semibold">{t.add_number}</h2>
            <p className="text-od-muted-4 mt-[6px] text-[13px] text-pretty">{t.provider_note}</p>
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

        <div className="p-[18px_22px]">
          <div className="text-od-text-5 mb-2 text-[12.5px] font-medium">{t.what_for}</div>
          <div className="border-od-border-2 bg-od-canvas-2 flex gap-[6px] rounded-[9px] border p-1">
            {(
              [
                ["voice", "ch_calls"],
                ["whatsapp", "ch_whatsapp"],
              ] as const
            ).map(([id, label]) => {
              const on = channel === id;
              return (
                <button
                  key={id}
                  type="button"
                  onClick={() => {
                    setChannel(id);
                    setProviderId(id === "voice" ? "twilio" : "meta");
                    setValues({});
                    setTouched(false);
                    setAnswers(["Lena"]);
                    setAnswerOpen(false);
                  }}
                  className="flex-[1_1_0] cursor-pointer rounded-[7px] border p-[8px_12px] text-[13.5px]"
                  style={{
                    borderColor: on ? "var(--od-border-9)" : "transparent",
                    background: on ? "var(--od-raise-7)" : "transparent",
                    color: on ? "var(--od-text)" : "var(--od-muted-4)",
                    fontWeight: on ? 500 : 400,
                  }}
                >
                  {t[label]}
                </button>
              );
            })}
          </div>
          <div className="text-od-faint mt-[7px] text-[12.5px] text-pretty">
            {channel === "whatsapp" ? t.whatsapp_kind : t.voice_kind}
          </div>

          <label className="text-od-text-5 mt-[18px] mb-[6px] block text-[12.5px] font-medium">
            {t.provider}
          </label>
          <div className="relative">
            <button
              type="button"
              onClick={() => setProviderOpen((value) => !value)}
              className="border-od-border-6 bg-od-panel-deep-3 hover:border-od-stroke flex w-full cursor-pointer items-center gap-[10px] rounded-lg border p-[10px_13px] text-start"
            >
              <span className="text-od-text min-w-0 flex-[1_1_auto] text-[14.5px]">
                {provider.name ?? (provider.nameKey ? t[provider.nameKey] : "")}
              </span>
              <span className="text-od-faint flex-none text-[10px]">▾</span>
            </button>
            {providerOpen ? (
              <div
                className="border-od-border-9 bg-od-panel absolute top-[calc(100%+6px)] start-0 z-30 w-full rounded-[9px] border p-[5px]"
                style={{ boxShadow: "0 14px 34px var(--od-scrim-3)" }}
              >
                {inChannel.map((entry) => (
                  <button
                    key={entry.id}
                    type="button"
                    disabled={!entry.ready}
                    onClick={() => {
                      if (!entry.ready) return;
                      setProviderId(entry.id);
                      setProviderOpen(false);
                    }}
                    className="flex w-full items-center gap-[9px] rounded-[7px] border-none p-[8px_10px] text-start text-[13.5px]"
                    style={{
                      cursor: entry.ready ? "pointer" : "not-allowed",
                      background: provider.id === entry.id ? "var(--od-raise-7)" : "transparent",
                      color: entry.ready ? "var(--od-text-3)" : "var(--od-faint-2)",
                    }}
                  >
                    <span className="min-w-0 flex-[1_1_auto] text-start">
                      {entry.name ?? (entry.nameKey ? t[entry.nameKey] : "")}
                    </span>
                    <span
                      className="flex-none text-[11.5px]"
                      style={{ color: entry.ready ? "var(--od-faint)" : "var(--od-faint-2)" }}
                    >
                      {entry.ready
                        ? provider.id === entry.id
                          ? t.opt_selected
                          : t.opt_available
                        : t.opt_not_yet}
                    </span>
                  </button>
                ))}
              </div>
            ) : null}
          </div>
          <div className="text-od-faint mt-[7px] text-[12.5px] text-pretty">
            {provider.note ? t[provider.note] : null}
          </div>

          <div className="mt-[18px] flex flex-col gap-[14px]">
            {provider.fields.map((field) => {
              const value = values[field.key] ?? "";
              const bad =
                touched && field.required && value.trim().length < (field.min ?? 1);
              return (
                <div key={field.key}>
                  <div className="flex flex-wrap items-baseline justify-between gap-2">
                    <label className="text-od-text-5 text-[12.5px] font-medium">
                      {t[field.label]}
                    </label>
                    <span className="text-od-faint text-[12px]">
                      {field.required ? t.required : t.optional}
                    </span>
                  </div>

                  {field.options ? (
                    <div className="relative">
                      <button
                        type="button"
                        onClick={() => setFieldOpen(fieldOpen === field.key ? null : field.key)}
                        className="mono border-od-border-6 bg-od-panel-deep-3 mt-[6px] flex w-full cursor-pointer items-center gap-[10px] rounded-lg border p-[10px_12px] text-[13.5px]"
                        style={{ color: value ? "var(--od-text-2)" : "var(--od-faint)" }}
                      >
                        <span className="min-w-0 flex-[1_1_auto] text-start">
                          {value || field.emptyLabel || t.choose}
                        </span>
                        <span className="text-od-faint flex-none text-[10px]">▾</span>
                      </button>
                      {fieldOpen === field.key ? (
                        <div
                          className="border-od-border-9 bg-od-panel absolute top-[calc(100%+6px)] start-0 z-30 max-h-[220px] w-full overflow-auto rounded-[9px] border p-[5px]"
                          style={{ boxShadow: "0 14px 34px var(--od-scrim-3)" }}
                        >
                          {field.options.map(([id, note]) => (
                            <button
                              key={id}
                              type="button"
                              onClick={() => {
                                setValues((current) => ({
                                  ...current,
                                  [field.key]: id === "nearest" ? "" : id,
                                }));
                                setFieldOpen(null);
                                setTouched(true);
                              }}
                              className="mono text-od-text-3 flex w-full cursor-pointer items-center gap-[9px] rounded-[7px] border-none p-[8px_10px] text-start text-[13px]"
                              style={{
                                background:
                                  (value || "nearest") === id ? "var(--od-raise-7)" : "transparent",
                              }}
                            >
                              <span className="min-w-0 flex-[1_1_auto] text-start">{id}</span>
                              <span className="text-od-faint flex-none text-[11.5px]">{t[note]}</span>
                            </button>
                          ))}
                        </div>
                      ) : null}
                    </div>
                  ) : (
                    <input
                      value={value}
                      onChange={(event) => {
                        setValues((current) => ({ ...current, [field.key]: event.target.value }));
                        setTouched(true);
                      }}
                      type={field.secret ? "password" : "text"}
                      placeholder={
                        field.placeholder ??
                        (field.placeholderKey ? t[field.placeholderKey] : undefined)
                      }
                      dir="ltr"
                      className="mono ltr-data text-od-text-2 mt-[6px] w-full rounded-lg border p-[10px_12px] text-[13.5px] outline-none"
                      style={{
                        borderColor: bad ? "var(--od-red-border-2)" : "var(--od-border-6)",
                        background: bad ? "var(--od-red-bg-6)" : "var(--od-panel-deep-3)",
                      }}
                    />
                  )}

                  <div className="text-od-faint mt-[5px] text-[12.5px] text-pretty">
                    {t[field.help]}
                  </div>
                </div>
              );
            })}
          </div>

          {channel === "whatsapp" ? (
            <div className="border-od-amber-border-2 mt-[18px] flex items-start gap-[11px] rounded-[9px] border bg-[var(--od-amber-bg-2)] p-[13px_15px]">
              <span className="mt-px flex-none text-[color:var(--od-amber)]">!</span>
              <div className="min-w-0 text-[13px] text-pretty text-[color:var(--od-amber-text-3)]">
                {t.wa_warning}
              </div>
            </div>
          ) : null}

          <div className="mt-[18px]">
            <div className="text-od-text-5 text-[12.5px] font-medium">{t.column_answers}</div>
            <div className="relative mt-2">
              <button
                type="button"
                onClick={() => setAnswerOpen((value) => !value)}
                className="border-od-border-6 bg-od-panel-deep-3 hover:border-od-stroke flex w-full cursor-pointer items-center gap-[10px] rounded-lg border p-[10px_13px] text-start"
              >
                <span
                  className="min-w-0 flex-[1_1_auto] text-[14.5px]"
                  style={{ color: answers.length ? "var(--od-text)" : "var(--od-faint)" }}
                >
                  {answers.length === 0 ? t.answered_voicemail : answers.map(nameOf).join(t.list_join)}
                </span>
                <span className="text-od-faint flex-none text-[10px]">▾</span>
              </button>
              {answerOpen ? (
                <div
                  className="border-od-border-9 bg-od-panel absolute top-[calc(100%+6px)] start-0 z-30 w-full rounded-[9px] border p-[5px]"
                  style={{ boxShadow: "0 14px 34px var(--od-scrim-3)" }}
                >
                  {answerChoices.map((choice) => {
                    const order = answers.indexOf(choice.id) + 1;
                    const on = order > 0;
                    return (
                      <button
                        key={choice.id}
                        type="button"
                        onClick={() =>
                          setAnswers((current) =>
                            on
                              ? current.filter((entry) => entry !== choice.id)
                              : [...current, choice.id],
                          )
                        }
                        className="flex w-full cursor-pointer items-center gap-[9px] rounded-[7px] border-none p-[8px_10px] text-start text-[13.5px]"
                        style={{
                          background: on ? "var(--od-raise-7)" : "transparent",
                          color: on ? "var(--od-text)" : "var(--od-text-5)",
                        }}
                      >
                        <span
                          className="mono inline-flex size-[18px] flex-none items-center justify-center rounded-[5px] border text-[11px] font-semibold"
                          style={{
                            borderColor: on ? "var(--od-violet-border)" : "var(--od-stroke-3)",
                            background: on ? "rgba(139,124,255,.16)" : "transparent",
                            color: on ? "var(--od-violet-3)" : "transparent",
                          }}
                        >
                          {on ? order : ""}
                        </span>
                        <span className="min-w-0 flex-[1_1_auto] text-start">{nameOf(choice.id)}</span>
                        <span className="text-od-faint flex-none text-[11.5px]">{t[choice.kind]}</span>
                      </button>
                    );
                  })}
                </div>
              ) : null}
            </div>
            <div className="text-od-faint mt-[7px] text-[12.5px] text-pretty">{answerNote}</div>
          </div>

          <div className="border-od-border-4 bg-od-panel-deep-4 mt-[18px] rounded-[9px] border p-[13px_15px]">
            <div className="text-[12.5px] text-pretty text-[color:var(--od-muted-3)]">
              {provider.after ? t[provider.after] : null}
            </div>
          </div>
        </div>

        <div className="border-od-border bg-od-panel-deep-2 flex flex-wrap justify-end gap-[10px] border-t p-[16px_22px]">
          <button
            type="button"
            onClick={onClose}
            className="border-od-border-2 text-od-muted hover:text-od-text-2 cursor-pointer rounded-[7px] border bg-transparent p-[9px_15px]"
          >
            {t.cancel}
          </button>
          <button
            type="button"
            onClick={() => (blocked ? setTouched(true) : onClose())}
            className="rounded-[7px] border p-[9px_16px] font-semibold"
            style={{
              cursor: blocked ? "not-allowed" : "pointer",
              borderColor: blocked ? "var(--od-border-3)" : "var(--od-stroke)",
              background: blocked ? "transparent" : "var(--od-raise-10)",
              color: blocked ? "var(--od-faint-2)" : "var(--od-text-2)",
            }}
          >
            {t.add_number_go}
          </button>
        </div>
      </div>
    </div>
  );
}

function ProviderRefused({ t, onFix }: { t: NumbersDictionary; onFix: () => void }) {
  return (
    <div className="flex justify-center py-[70px]">
      <div className="border-od-border-9 bg-od-panel w-full max-w-[560px] rounded-xl border p-8">
        <div className="border-od-red-border bg-od-red-bg inline-flex items-center gap-2 rounded-md border p-[5px_10px] text-[12px] font-semibold text-[color:var(--od-red-text)]">
          {t.error_label}
        </div>
        <h2 className="mt-[18px] mb-0 text-[21px] font-semibold">{t.error_title}</h2>
        <p className="text-od-muted mt-[10px] max-w-[46ch] text-pretty">
          {t.error_body_before}
          <span className="mono">403 Forbidden</span>
          {t.error_body_after}
        </p>
        <div className="mt-5 flex flex-wrap gap-[10px]">
          <button
            type="button"
            onClick={onFix}
            className="border-od-stroke bg-od-raise-10 text-od-text-2 hover:bg-od-border-3 cursor-pointer rounded-md border p-[9px_16px] font-medium"
          >
            {t.error_update}
          </button>
          <button
            type="button"
            className="border-od-border-2 text-od-muted hover:text-od-text-2 cursor-pointer rounded-md border bg-transparent p-[9px_16px]"
          >
            {t.error_test}
          </button>
        </div>
      </div>
    </div>
  );
}
