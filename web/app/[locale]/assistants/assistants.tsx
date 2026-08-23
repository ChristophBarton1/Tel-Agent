"use client";

import Link from "next/link";
import { useState } from "react";

import { Sidebar } from "@/components/shell/sidebar";
import { StatePreview, type ScreenState } from "@/components/state-preview";
import { interpolate } from "@/lib/i18n";
import type { Locale } from "@/lib/locales";

import type { AssistantsDictionary } from "./page";

type Key = keyof AssistantsDictionary;

/**
 * The design ships its own light and dark palettes because each file in the design
 * tool stands alone. Here the tokens already flip with `data-od-theme`, so this screen
 * uses them directly rather than carrying a second theme system.
 */

/** WhatsApp and Telegram are product names; "Phone" and "Web chat" are ours. */
type ChannelId = "phone" | "whatsapp" | "telegram" | "webchat";

const INSTALLED_CHANNELS: {
  id: ChannelId;
  name?: string;
  nameKey?: Key;
  label: Key;
  note: Key;
}[] = [
  {
    id: "phone",
    nameKey: "channel_phone",
    label: "channel_phone_label",
    note: "channel_phone_note",
  },
  {
    id: "whatsapp",
    name: "WhatsApp",
    label: "channel_whatsapp_label",
    note: "channel_whatsapp_note",
  },
  {
    id: "telegram",
    name: "Telegram",
    label: "channel_telegram_label",
    note: "channel_telegram_note",
  },
  {
    id: "webchat",
    nameKey: "channel_webchat",
    label: "channel_webchat_label",
    note: "channel_webchat_note",
  },
];

/** An assistant's name is data; its role and how it is connected are copy. */
type Assistant = {
  name: string;
  role: Key;
  channels: ChannelId[];
  connection?: string;
  connectionKey?: Key;
  last: Key;
  unassigned?: boolean;
};

const ASSISTANTS: Assistant[] = [
  {
    name: "Lena",
    role: "role_lena",
    channels: ["phone", "whatsapp", "webchat"],
    connection: "+43 1 987 6543",
    last: "last_2min",
  },
  {
    name: "Anna",
    role: "role_anna",
    channels: ["phone"],
    connectionKey: "conn_none",
    last: "last_yesterday",
    unassigned: true,
  },
  {
    name: "Mark",
    role: "role_mark",
    channels: ["whatsapp", "telegram"],
    connectionKey: "conn_business",
    last: "last_18min",
  },
  {
    name: "Felix",
    role: "role_felix",
    channels: ["phone"],
    connectionKey: "conn_shared",
    last: "last_3days",
  },
];

const COLUMNS =
  "minmax(0,1.6fr) minmax(110px, max-content) minmax(0,1.4fr) minmax(100px, max-content)";

function ChannelBadge({ id, label }: { id: ChannelId; label: string }) {
  const phone = id === "phone";
  return (
    <span
      className="rounded-md border p-[3px_9px] text-[12px] font-medium whitespace-nowrap"
      style={{
        borderColor: phone ? "var(--od-violet-border)" : "var(--od-green-border)",
        background: phone ? "rgba(139,124,255,.13)" : "rgba(63,185,132,.11)",
        color: phone ? "var(--od-violet-3)" : "var(--od-green-text)",
      }}
    >
      {label}
    </span>
  );
}

export function Assistants({ locale, t }: { locale: Locale; t: AssistantsDictionary }) {
  const channelLabel = (id: ChannelId) => {
    const channel = INSTALLED_CHANNELS.find((entry) => entry.id === id);
    return channel?.nameKey ? t[channel.nameKey] : (channel?.name ?? "");
  };

  const [state, setState] = useState<ScreenState>("default");
  const [filter, setFilter] = useState<"all" | ChannelId>("all");
  const [createOpen, setCreateOpen] = useState(false);

  const offline = state === "offline";
  const empty = state === "empty";
  const showList = state === "default" || empty || offline;

  const rows = ASSISTANTS.filter(
    (assistant) => filter === "all" || assistant.channels.includes(filter),
  );

  return (
    <div className="bg-od-canvas text-od-text-3 min-h-dvh text-[14px] leading-[1.45] ps-[224px]">
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
            <div className="mt-[3px] text-pretty text-[color:var(--od-red-text-2)]">
              {t.offline_body_before}
              <span className="mono">sip.easybell.de</span>
              {t.offline_body_middle}
              <span className="mono">09:58</span>
              {t.offline_body_after}
            </div>
          </div>
          <button
            type="button"
            className="border-od-red-border bg-od-red-bg-2 hover:bg-od-red-bg-3 cursor-pointer rounded-md border p-[8px_14px] font-medium whitespace-nowrap text-[color:var(--od-red-text)]"
          >
            Retry registration
          </button>
        </div>
      ) : null}

      <div className="mx-auto max-w-[1240px] p-[22px_28px_70px]">
        {state === "error" ? <ServiceDown t={t} /> : null}

        {state === "loading" ? (
          <div>
            <div
              className="h-7 w-[190px] rounded-md"
              style={{
                background: "linear-gradient(90deg,var(--od-panel),var(--od-raise-7),var(--od-panel))",
                backgroundSize: "420px 100%",
                animation: "od-shimmer 1.4s linear infinite",
              }}
            />
            <div className="mt-6 flex flex-col gap-[10px]">
              {[0, 1, 2, 3].map((index) => (
                <div
                  key={index}
                  className="border-od-line h-[62px] rounded-[10px] border"
                  style={{
                    background:
                      "linear-gradient(90deg,var(--od-panel),var(--od-raise-7),var(--od-panel))",
                    backgroundSize: "420px 100%",
                    animation: "od-shimmer 1.4s linear infinite",
                  }}
                />
              ))}
            </div>
          </div>
        ) : null}

        {showList ? (
          <div>
            <div className="flex flex-wrap items-end justify-between gap-x-5 gap-y-[14px]">
              <div className="max-w-[62ch]">
                <h1 className="text-od-text m-0 text-[24px] font-semibold tracking-[-0.015em]">
                  {t.title}
                </h1>
                <p className="text-od-muted-4 mt-[6px] text-pretty">{t.intro}</p>
              </div>
              <button
                type="button"
                onClick={() => setCreateOpen(true)}
                className="border-od-stroke bg-od-raise-10 text-od-text hover:bg-od-border-3 cursor-pointer rounded-[7px] border p-[9px_15px] text-[13.5px] font-semibold whitespace-nowrap"
              >
                {t.create}
              </button>
            </div>

            <div className="mt-[18px] flex flex-wrap items-center gap-[10px]">
              <div className="border-od-line bg-od-panel-deep-3 flex min-w-[240px] flex-[1_1_300px] items-center gap-[10px] rounded-lg border p-[9px_13px]">
                <span className="text-od-faint-2 text-[15px]">⌕</span>
                <input
                  placeholder={t.search_placeholder}
                  className="text-od-text-3 min-w-0 flex-1 border-none bg-transparent text-[14.5px] outline-none"
                />
              </div>
              {(["all", ...INSTALLED_CHANNELS.map((channel) => channel.id)] as const).map((id) => (
                <button
                  key={id}
                  type="button"
                  onClick={() => setFilter(id)}
                  className={`cursor-pointer rounded-lg border p-[8px_13px] text-[13.5px] whitespace-nowrap ${
                    filter === id
                      ? "border-od-stroke bg-od-raise-5 text-od-text"
                      : "border-od-line bg-od-panel-deep-3 text-od-muted-4"
                  }`}
                >
                  {id === "all" ? t.filter_all : channelLabel(id)}
                </button>
              ))}
            </div>

            {empty ? (
              <div className="border-od-stroke bg-od-panel-deep-3 mt-[18px] rounded-[10px] border border-dashed p-[38px_28px]">
                <h3 className="text-od-text m-0 text-[18px] font-semibold">{t.empty_title}</h3>
                <p className="text-od-muted-4 mt-[10px] max-w-[58ch] text-pretty">{t.empty_body}</p>
                <div className="mt-4 flex flex-wrap gap-[10px]">
                  <button
                    type="button"
                    onClick={() => setCreateOpen(true)}
                    className="border-od-stroke bg-od-raise-10 text-od-text hover:bg-od-border-3 cursor-pointer rounded-[7px] border p-[9px_15px] text-[13.5px] font-semibold"
                  >
                    {t.empty_create}
                  </button>
                  <Link
                    href={`/${locale}/install`}
                    className="border-od-line text-od-muted-4 hover:text-od-text-2 inline-block rounded-[7px] border p-[9px_15px] text-[13.5px] hover:no-underline"
                  >
                    {t.empty_setup}
                  </Link>
                </div>
              </div>
            ) : (
              <div className="border-od-line bg-od-panel-deep-3 mt-[18px] overflow-hidden rounded-[10px] border">
                <div
                  className="border-od-line bg-od-canvas-2 text-od-faint-2 grid gap-[18px] border-b p-[11px_18px] text-[11px] tracking-[.08em] uppercase"
                  style={{ gridTemplateColumns: COLUMNS }}
                >
                  <span>{t.column_name}</span>
                  <span>{t.column_channels}</span>
                  <span>{t.column_connection}</span>
                  <span>{t.column_last}</span>
                </div>

                {rows.map((assistant, index) => (
                  <Link
                    key={assistant.name}
                    href={`/${locale}/assistants/${assistant.name.toLowerCase()}`}
                    className={`hover:bg-od-raise grid cursor-pointer items-center gap-[18px] p-[13px_18px] text-inherit hover:no-underline ${
                      index === 0 ? "" : "border-t border-[color:var(--od-raise-6)]"
                    }`}
                    style={{ gridTemplateColumns: COLUMNS }}
                  >
                    <div className="flex min-w-0 items-center gap-[11px]">
                      <span className="border-od-line text-od-text-3 inline-flex size-8 flex-none items-center justify-center rounded-full border bg-[var(--od-raise-5)] text-[13px] font-semibold">
                        {assistant.name.slice(0, 1)}
                      </span>
                      <div className="min-w-0">
                        <div className="text-od-text font-medium text-pretty">{assistant.name}</div>
                        <div className="text-od-muted-4 mt-[2px] text-[12.5px] text-pretty">
                          {t[assistant.role]}
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-wrap justify-self-start gap-[5px]">
                      {assistant.channels.map((channel) => (
                        <ChannelBadge key={channel} id={channel} label={channelLabel(channel)} />
                      ))}
                    </div>

                    <div className="min-w-0">
                      {/* A number is data; "no number assigned" is a sentence. */}
                      {assistant.connectionKey ? (
                        <div
                          className="text-[12.5px] [overflow-wrap:anywhere]"
                          style={{
                            color: assistant.unassigned ? "var(--od-faint-2)" : "var(--od-text-3)",
                          }}
                        >
                          {t[assistant.connectionKey]}
                        </div>
                      ) : (
                        <div
                          dir="ltr"
                          className="mono ltr-data text-od-text-3 text-start text-[12.5px] [overflow-wrap:anywhere]"
                        >
                          {assistant.connection}
                        </div>
                      )}
                      {assistant.unassigned ? (
                        <button
                          type="button"
                          className="border-od-line text-od-muted-4 mt-[6px] cursor-pointer rounded-md border bg-transparent p-[5px_10px] text-[12.5px] whitespace-nowrap"
                        >
                          {t.assign_number}
                        </button>
                      ) : null}
                    </div>

                    <span className="text-od-faint-2 text-[12.5px]">{t[assistant.last]}</span>
                  </Link>
                ))}
              </div>
            )}
          </div>
        ) : null}
      </div>

      {createOpen ? (
        <CreateDialog locale={locale} t={t} onClose={() => setCreateOpen(false)} />
      ) : null}
    </div>
  );
}

function CreateDialog({
  locale,
  t,
  onClose,
}: {
  locale: Locale;
  t: AssistantsDictionary;
  onClose: () => void;
}) {
  const [channels, setChannels] = useState<ChannelId[]>(["phone", "whatsapp"]);

  const hint =
    channels.length === 0
      ? t.hint_none
      : channels.length === 1
        ? t.hint_one
        : interpolate(t.hint_many, { count: channels.length });

  return (
    <div
      className="fixed inset-0 z-[60] flex items-start justify-center overflow-auto p-[60px_24px]"
      style={{ background: "var(--od-scrim-3)" }}
    >
      <div className="border-od-line bg-od-panel-deep-3 w-full max-w-[560px] rounded-xl border p-6">
        <div className="flex flex-wrap items-start justify-between gap-x-5 gap-y-3">
          <h2 className="text-od-text m-0 text-[19px] font-semibold">{t.create}</h2>
          <button
            type="button"
            onClick={onClose}
            className="border-od-line text-od-muted-4 hover:text-od-text-2 cursor-pointer rounded-[7px] border bg-transparent p-[9px_15px] text-[13.5px]"
          >
            {t.close}
          </button>
        </div>

        <div className="text-od-text-3 mt-[18px] font-medium">{t.dialog_answers_on}</div>
        <div
          className="mt-2 grid gap-[10px]"
          style={{ gridTemplateColumns: "repeat(auto-fit, minmax(188px, 1fr))" }}
        >
          {INSTALLED_CHANNELS.map((channel) => {
            const on = channels.includes(channel.id);
            return (
              <button
                key={channel.id}
                type="button"
                onClick={() =>
                  setChannels((current) =>
                    current.includes(channel.id)
                      ? current.filter((entry) => entry !== channel.id)
                      : [...current, channel.id],
                  )
                }
                className="flex cursor-pointer flex-col justify-start rounded-[9px] border p-[14px_15px] text-start"
                style={{
                  borderColor: on ? "var(--od-violet-border)" : "var(--od-line)",
                  background: on ? "rgba(139,124,255,.13)" : "transparent",
                }}
              >
                <span className="flex items-start gap-[10px]">
                  <span
                    className="mt-[2px] inline-flex size-[17px] flex-none items-center justify-center rounded-[5px] border text-[11px] leading-none font-bold text-white"
                    style={{
                      borderColor: on ? "var(--od-violet)" : "var(--od-stroke-5)",
                      background: on ? "var(--od-violet)" : "transparent",
                    }}
                  >
                    {on ? "✓" : ""}
                  </span>
                  <span className="min-w-0">
                    <span className="text-od-text block font-semibold">{t[channel.label]}</span>
                    <span className="text-od-muted-4 mt-[3px] block text-[12.5px] text-pretty">
                      {t[channel.note]}
                    </span>
                  </span>
                </span>
              </button>
            );
          })}
        </div>

        <div className="text-od-faint mt-[10px] max-w-[66ch] text-[12.5px] text-pretty">
          {hint}{" "}
          <Link href={`/${locale}/apps`} className="text-od-violet hover:underline">
            {t.install_channel}
          </Link>
          {t.install_note}
        </div>

        <div className="text-od-text-3 mt-[18px] font-medium">{t.dialog_name}</div>
        <div className="border-od-line bg-od-canvas-2 text-od-text mt-2 rounded-lg border p-[11px_13px] text-[15px]">
          Lena
        </div>
        <div className="text-od-faint mt-2 text-[12.5px] text-pretty">{t.dialog_name_note}</div>

        <div className="mt-5 flex flex-wrap justify-end gap-[10px]">
          <button
            type="button"
            onClick={onClose}
            className="border-od-line text-od-muted-4 hover:text-od-text-2 cursor-pointer rounded-[7px] border bg-transparent p-[9px_15px] text-[13.5px]"
          >
            {t.cancel}
          </button>
          <button
            type="button"
            onClick={onClose}
            className="border-od-stroke bg-od-raise-10 text-od-text cursor-pointer rounded-[7px] border p-[9px_15px] text-[13.5px] font-semibold"
          >
            {t.create}
          </button>
        </div>
      </div>
    </div>
  );
}

function ServiceDown({ t }: { t: AssistantsDictionary }) {
  return (
    <div className="flex justify-center py-[70px]">
      <div className="border-od-line bg-od-panel-deep-3 w-full max-w-[560px] rounded-xl border p-8">
        <div className="border-od-red-border bg-od-red-bg inline-flex items-center gap-2 rounded-md border p-[5px_10px] text-[12px] font-semibold text-[color:var(--od-red-text)]">
          {t.error_label}
        </div>
        <h2 className="text-od-text mt-4 mb-0 text-[21px] font-semibold">{t.error_title}</h2>
        <p className="text-od-muted-4 mt-[10px] max-w-[58ch] text-pretty">{t.error_body}</p>
        <div className="mt-[18px] flex flex-wrap gap-[10px]">
          <button
            type="button"
            className="border-od-stroke bg-od-raise-10 text-od-text hover:bg-od-border-3 cursor-pointer rounded-[7px] border p-[9px_15px] text-[13.5px] font-semibold"
          >
            {t.error_restart}
          </button>
          <button
            type="button"
            className="border-od-line text-od-muted-4 hover:text-od-text-2 cursor-pointer rounded-[7px] border bg-transparent p-[9px_15px] text-[13.5px]"
          >
            {t.error_logs}
          </button>
        </div>
      </div>
    </div>
  );
}
