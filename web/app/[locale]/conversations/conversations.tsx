"use client";

import Link from "next/link";
import { useState } from "react";

import { Sidebar } from "@/components/shell/sidebar";
import { StatePreview, type ScreenState } from "@/components/state-preview";
import { interpolate } from "@/lib/i18n";
import type { Locale } from "@/lib/locales";

import type { ConversationsDictionary } from "./page";

type Key = keyof ConversationsDictionary;

/**
 * Channel names are product names and are never translated - WhatsApp is WhatsApp
 * in every language. "Web chat" is ours, so it is the one that carries a key.
 */
type ChannelId = "whatsapp" | "telegram" | "sms" | "webchat";

const CHANNELS: Record<
  ChannelId,
  { name?: string; nameKey?: Key; color: string; border: string; background: string }
> = {
  whatsapp: {
    name: "WhatsApp",
    color: "var(--od-green-text)",
    border: "var(--od-green-border)",
    background: "rgba(63,185,132,.11)",
  },
  telegram: {
    name: "Telegram",
    color: "var(--od-muted-2)",
    border: "var(--od-border-9)",
    background: "var(--od-raise-5)",
  },
  sms: {
    name: "SMS",
    color: "var(--od-muted-2)",
    border: "var(--od-border-9)",
    background: "var(--od-raise-5)",
  },
  webchat: {
    nameKey: "filter_webchat",
    color: "var(--od-muted-2)",
    border: "var(--od-border-9)",
    background: "var(--od-raise-5)",
  },
};

/**
 * What a customer wrote is a record, not interface copy: the preview and the message
 * bubbles below it are the same words, so neither is translated. Only the labels
 * around them - the day, the state, the tags - are. An attachment is the
 * exception: "sent a photo" is the interface describing the message, not the
 * message, so it carries a key.
 */
type Thread = {
  id: string;
  name?: string;
  nameKey?: Key;
  channel: ChannelId;
  day: Key;
  when: string;
  preview?: string;
  previewKey?: Key;
  state: Key;
  ok: boolean;
  active?: boolean;
  starred?: boolean;
  unread?: number;
  tags: Key[];
};

const THREADS: Thread[] = [
  {
    id: "gruber",
    name: "Anna Gruber",
    channel: "whatsapp",
    day: "day_today",
    when: "09:52",
    preview: "Perfect, Thursday at 10 works. Thank you!",
    state: "state_handled",
    ok: true,
    active: true,
    starred: true,
    tags: ["tag_reschedule"],
  },
  {
    id: "berger",
    name: "Julia Berger",
    channel: "whatsapp",
    day: "day_today",
    when: "09:31",
    preview: "Can I move my appointment to next week?",
    state: "state_waiting",
    ok: false,
    unread: 2,
    tags: [],
  },
  {
    id: "sms-stop",
    name: "+43 676 220 0043",
    channel: "sms",
    day: "day_today",
    when: "08:47",
    preview: "STOP",
    state: "state_opted_out",
    ok: true,
    tags: ["tag_optout"],
  },
  {
    id: "brandl",
    name: "Thomas Brandl",
    channel: "telegram",
    day: "day_yesterday",
    when: "17:20",
    preview: "Booked — Friday 08:00. A confirmation is on its way.",
    state: "state_handled",
    ok: true,
    tags: ["tag_new_customer"],
  },
  {
    id: "visitor",
    nameKey: "thread_visitor",
    channel: "webchat",
    day: "day_yesterday",
    when: "11:05",
    preview: "Do you take jobs on Saturdays?",
    state: "state_handled",
    ok: true,
    tags: [],
  },
  {
    id: "bauer",
    name: "Karin Bauer",
    channel: "whatsapp",
    day: "day_tuesday",
    when: "15:41",
    previewKey: "preview_photo",
    state: "state_needs_look",
    ok: false,
    unread: 1,
    starred: true,
    tags: ["tag_referral"],
  },
];

const MESSAGES = [
  {
    who: "them" as const,
    text: "Good morning, I have an appointment on Tuesday at 14:00 but I need to move it.",
    meta: "09:44",
  },
  {
    who: "agent" as const,
    text: "Good morning, Ms Gruber. Thursday at 10:00 is free — shall I move you to that?",
    meta: "09:44 · Lena · check_calendar 890 ms",
  },
  { who: "them" as const, text: "Perfect, Thursday at 10 works. Thank you!", meta: "09:52" },
  {
    who: "agent" as const,
    text: "Done. You are booked for Thursday at 10:00 with Georg Wagner. I have sent a confirmation here.",
    meta: "09:52 · Lena · book_appointment 1,120 ms",
  },
];

const FILTERS: { id: "all" | ChannelId; labelKey?: Key; label?: string }[] = [
  { id: "all", labelKey: "filter_all" },
  { id: "whatsapp", label: "WhatsApp" },
  { id: "telegram", label: "Telegram" },
  { id: "sms", label: "SMS" },
  { id: "webchat", labelKey: "filter_webchat" },
];

const MORE_ITEMS: { label: Key; danger: boolean }[] = [
  { label: "more_unread", danger: false },
  { label: "more_assign", danger: false },
  { label: "more_export", danger: false },
  { label: "more_block", danger: true },
];

function Tag({ label }: { label: string }) {
  return (
    <span className="border-od-border-7 text-od-muted-4 rounded-full border bg-[var(--od-raise-5)] p-[1px_8px] text-[11px] font-medium whitespace-nowrap">
      {label}
    </span>
  );
}

export function Conversations({
  locale,
  t,
}: {
  locale: Locale;
  t: ConversationsDictionary;
}) {
  const [state, setState] = useState<ScreenState>("default");
  const [filter, setFilter] = useState<"all" | ChannelId>("all");
  const [starred, setStarred] = useState(true);
  const [moreOpen, setMoreOpen] = useState(false);

  const offline = state === "offline";
  const empty = state === "empty";
  const showList = state === "default" || empty || offline;

  const visible = THREADS.filter((thread) => filter === "all" || thread.channel === filter);
  const days = visible.reduce<{ label: Key; threads: Thread[] }[]>((groups, thread) => {
    const group = groups.find((entry) => entry.label === thread.day);
    if (group) group.threads.push(thread);
    else groups.push({ label: thread.day, threads: [thread] });
    return groups;
  }, []);

  return (
    <div className="bg-od-canvas text-od-text-2 min-h-dvh text-[14px] leading-[1.45] ps-[224px]">
      <div className="fixed inset-y-0 start-0 z-50 h-dvh w-[224px]">
        <Sidebar locale={locale} active="conversations" />
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
              <span className="mono">09:20</span>
              {t.offline_body_after}
            </div>
          </div>
          <button
            type="button"
            className="border-od-red-border-2 bg-od-red-bg-2 hover:bg-od-red-bg-3 cursor-pointer rounded-md border p-[8px_14px] font-medium text-[color:var(--od-red-text-3)]"
          >
            {t.offline_action}
          </button>
        </div>
      ) : null}

      <div className="mx-auto max-w-[1500px] p-[22px_28px_60px]">
        {state === "error" ? <StoreLocked t={t} /> : null}
        {state === "loading" ? <ConversationsSkeleton /> : null}

        {showList ? (
          <div>
            <div className="flex flex-wrap items-end justify-between gap-x-5 gap-y-[14px]">
              <h1 className="text-od-text m-0 text-[26px] font-semibold tracking-[-0.02em]">
                {t.title}
              </h1>
              <div className="flex flex-wrap gap-2">
                {FILTERS.map((entry) => (
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
                    {entry.labelKey ? t[entry.labelKey] : entry.label}
                  </button>
                ))}
              </div>
            </div>

            {empty ? (
              <div className="border-od-border-6 bg-od-panel-deep-2 mt-[18px] rounded-[10px] border border-dashed p-[40px_28px]">
                <h3 className="m-0 text-[18px] font-semibold">{t.empty_title}</h3>
                <p className="text-od-muted mt-[10px] max-w-[60ch] text-pretty">{t.empty_body}</p>
                <Link
                  href={`/${locale}/apps`}
                  className="border-od-stroke bg-od-raise-10 text-od-text-2 hover:bg-od-border-3 mt-4 inline-block rounded-md border p-[9px_16px] font-medium hover:no-underline"
                >
                  {t.empty_action}
                </Link>
              </div>
            ) : (
              <div className="mt-[18px] flex flex-wrap items-start gap-5">
                <div className="border-od-line bg-od-panel-deep-3 max-w-[400px] min-w-[min(100%,300px)] flex-[1_1_320px] overflow-hidden rounded-[10px] border">
                  {days.map((group) => (
                    <div key={group.label}>
                      <div className="bg-od-canvas-2 sticky top-0 z-[2] flex items-center justify-between gap-[10px] border-b border-[color:var(--od-raise-6)] p-[8px_16px]">
                        <span className="text-od-faint text-[11px] font-semibold tracking-[.09em] uppercase">
                          {t[group.label]}
                        </span>
                        <span className="text-od-faint-2 text-[11.5px]">
                          {group.threads.length === 1
                            ? t.conversations_one
                            : interpolate(t.conversations_many, { count: group.threads.length })}
                        </span>
                      </div>

                      {group.threads.map((thread) => {
                        const channel = CHANNELS[thread.channel];
                        return (
                          <div
                            key={thread.id}
                            className="cursor-pointer border-b border-[color:var(--od-raise-6)] p-[13px_16px]"
                            style={{
                              background: thread.active ? "var(--od-raise)" : "transparent",
                              borderInlineStart: `2px solid ${thread.active ? "var(--od-violet)" : "transparent"}`,
                            }}
                          >
                            <div className="flex flex-wrap items-center gap-2">
                              <span
                                className="rounded border p-[1px_7px] text-[11px] font-semibold whitespace-nowrap"
                                style={{
                                  borderColor: channel.border,
                                  background: channel.background,
                                  color: channel.color,
                                }}
                              >
                                {channel.nameKey ? t[channel.nameKey] : channel.name}
                              </span>
                              <span className="text-od-text font-medium text-pretty">
                                {thread.nameKey ? t[thread.nameKey] : thread.name}
                              </span>
                              {thread.starred ? (
                                <span className="text-[12px] leading-none text-[color:var(--od-amber)]">
                                  ★
                                </span>
                              ) : null}
                              <span
                                dir="ltr"
                                className="mono ltr-data text-od-faint ms-auto text-[11.5px]"
                              >
                                {thread.when}
                              </span>
                            </div>

                            {/* What the customer wrote, verbatim. */}
                            <div
                              dir="ltr"
                              className="text-od-muted-2 mt-[6px] line-clamp-2 text-start text-[13px] text-pretty"
                            >
                              {thread.previewKey ? t[thread.previewKey] : thread.preview}
                            </div>

                            <div className="mt-[7px] flex flex-wrap items-center gap-2">
                              <span
                                className="text-[12px] font-medium"
                                style={{
                                  color: thread.ok ? "var(--od-faint)" : "var(--od-amber-text)",
                                }}
                              >
                                {t[thread.state]}
                              </span>
                              {thread.tags.map((tag) => (
                                <Tag key={tag} label={t[tag]} />
                              ))}
                              {thread.unread ? (
                                <span className="ms-auto rounded-full bg-[color:var(--od-violet)] p-[1px_7px] text-[11px] font-bold text-[color:var(--od-canvas-violet)]">
                                  {thread.unread}
                                </span>
                              ) : null}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ))}
                </div>

                <div className="border-od-line bg-od-panel-deep-3 flex min-w-[min(100%,420px)] flex-[2_1_460px] flex-col overflow-hidden rounded-[10px] border">
                  <div className="border-od-line bg-od-canvas-2 flex flex-wrap items-center justify-between gap-x-[18px] gap-y-3 border-b p-[14px_18px]">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-[9px]">
                        <span className="text-od-text text-[16px] font-semibold">Anna Gruber</span>
                        <span className="border-od-green-border rounded-[5px] border bg-[rgba(63,185,132,.11)] p-[2px_9px] text-[11.5px] font-semibold text-[color:var(--od-green-text)]">
                          WhatsApp
                        </span>
                        <Tag label={t.tag_reschedule} />
                      </div>
                      <div dir="ltr" className="mono ltr-data text-od-muted-5 mt-[3px] text-[12.5px]">
                        +43 664 1234567
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setStarred((value) => !value)}
                        title={starred ? t.star_remove : t.star_add}
                        aria-label={starred ? t.star_remove : t.star_add}
                        className="inline-flex size-8 cursor-pointer items-center justify-center rounded-md border text-[14px] leading-none"
                        style={{
                          borderColor: starred ? "var(--od-amber-border)" : "var(--od-border-7)",
                          background: starred ? "var(--od-amber-bg)" : "transparent",
                          color: starred ? "var(--od-amber-text)" : "var(--od-muted-4)",
                        }}
                      >
                        ★
                      </button>
                      <ActionButton label={t.action_tag} glyph="tag" />
                      <ActionButton label={t.action_archive} glyph="archive" />

                      <div className="relative">
                        <button
                          type="button"
                          onClick={() => setMoreOpen((value) => !value)}
                          aria-label={t.action_more}
                          className="border-od-border-7 text-od-muted-4 hover:text-od-text-3 inline-flex size-8 cursor-pointer items-center justify-center rounded-md border bg-transparent text-[16px] leading-none hover:bg-[var(--od-raise-4)]"
                        >
                          ⋯
                        </button>
                        {moreOpen ? (
                          <div
                            className="border-od-border-9 bg-od-panel absolute top-[38px] end-0 z-50 flex w-[214px] flex-col gap-px rounded-[9px] border p-[5px]"
                            style={{ boxShadow: "0 12px 28px var(--od-scrim-4)" }}
                          >
                            {MORE_ITEMS.map((item) => (
                              <button
                                key={item.label}
                                type="button"
                                className="cursor-pointer rounded-md border-none bg-transparent p-[8px_10px] text-start text-[13.5px] hover:bg-[var(--od-raise-5)]"
                                style={{
                                  color: item.danger ? "var(--od-red-text-4)" : "var(--od-text-3)",
                                }}
                              >
                                {t[item.label]}
                              </button>
                            ))}
                          </div>
                        ) : null}
                      </div>

                      <Link
                        href={`/${locale}/contacts`}
                        className="border-od-border-7 text-od-muted hover:text-od-text-2 rounded-md border p-[7px_12px] text-[13px] hover:bg-[var(--od-raise-4)] hover:no-underline"
                      >
                        {t.open_contact}
                      </Link>
                      <button
                        type="button"
                        className="border-od-stroke bg-od-raise-10 text-od-text-2 hover:bg-od-border-3 cursor-pointer rounded-md border p-[7px_12px] text-[13px] font-medium"
                      >
                        {t.take_over}
                      </button>
                    </div>
                  </div>

                  <div className="flex flex-col gap-3 p-[18px]">
                    {MESSAGES.map((message, index) => {
                      const them = message.who === "them";
                      return (
                        <div
                          key={index}
                          className={`flex flex-col ${them ? "items-start" : "items-end"}`}
                        >
                          <div
                            dir="ltr"
                            className="max-w-[84%] rounded-[10px] border p-[11px_14px] text-start text-[15px] leading-[1.65] text-pretty"
                            style={{
                              borderColor: them ? "var(--od-border-6)" : "var(--od-violet-border)",
                              background: them ? "var(--od-raise)" : "rgba(139,124,255,.10)",
                              color: them ? "var(--od-text-4)" : "var(--od-violet-4)",
                            }}
                          >
                            {message.text}
                          </div>
                          <div
                            dir="ltr"
                            className="mono ltr-data text-od-faint-2 mt-1 text-[11.5px]"
                          >
                            {message.meta}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  <div className="border-od-line mt-auto flex flex-wrap items-center gap-[10px] border-t p-[14px_18px]">
                    <input
                      placeholder={t.compose_placeholder}
                      className="border-od-border-6 bg-od-canvas-2 text-od-text-2 min-w-0 flex-[1_1_200px] rounded-lg border p-[10px_13px] outline-none"
                    />
                    <button
                      type="button"
                      className="border-od-stroke bg-od-raise-10 text-od-text-2 hover:bg-od-border-3 cursor-pointer rounded-lg border p-[10px_15px] font-medium"
                    >
                      {t.send}
                    </button>
                  </div>
                  <div className="text-od-faint p-[0_18px_14px] text-[12.5px] text-pretty">
                    {t.compose_note}
                  </div>
                </div>
              </div>
            )}
          </div>
        ) : null}
      </div>
    </div>
  );
}

const ACTION_PATHS: Record<string, string> = {
  tag: "M3 11.5 11.5 3H20a1 1 0 0 1 1 1v8.5L12.5 21a1 1 0 0 1-1.4 0l-7.7-7.7a1 1 0 0 1 0-1.4Z M16.5 7.5h.01",
  archive: "M3 6.5h18v3H3v-3Z M4.5 9.5v10h15v-10 M9.5 13.5h5",
};

function ActionButton({ label, glyph }: { label: string; glyph: string }) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      className="border-od-border-7 text-od-muted-4 hover:text-od-text-3 inline-flex size-8 cursor-pointer items-center justify-center rounded-md border bg-transparent hover:bg-[var(--od-raise-4)]"
    >
      <svg
        viewBox="0 0 24 24"
        width={15}
        height={15}
        fill="none"
        stroke="currentColor"
        strokeWidth={1.7}
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        {ACTION_PATHS[glyph].split(" M").map((segment, index) => (
          <path key={index} d={(index ? "M" : "") + segment} />
        ))}
      </svg>
    </button>
  );
}

function StoreLocked({ t }: { t: ConversationsDictionary }) {
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
            {t.error_retry}
          </button>
          <button
            type="button"
            className="border-od-border-2 text-od-muted hover:text-od-text-2 cursor-pointer rounded-md border bg-transparent p-[9px_16px]"
          >
            {t.error_stop_backup}
          </button>
        </div>
      </div>
    </div>
  );
}

function ConversationsSkeleton() {
  const shimmer = {
    background: "linear-gradient(90deg,var(--od-panel),var(--od-raise-7),var(--od-panel))",
    backgroundSize: "420px 100%",
    animation: "od-shimmer 1.4s linear infinite",
  };

  return (
    <div className="flex flex-wrap gap-5">
      <div className="flex max-w-[380px] flex-[1_1_320px] flex-col gap-[10px]">
        {[0, 1, 2, 3, 4, 5].map((index) => (
          <div
            key={index}
            className="border-od-raise-12 h-[74px] rounded-[10px] border"
            style={shimmer}
          />
        ))}
      </div>
      <div
        className="border-od-raise-12 h-[520px] flex-[2_1_420px] rounded-[10px] border"
        style={shimmer}
      />
    </div>
  );
}
