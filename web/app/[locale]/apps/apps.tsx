"use client";

import Link from "next/link";
import { useState } from "react";

import { Sidebar } from "@/components/shell/sidebar";
import { StatePreview, type ScreenState } from "@/components/state-preview";
import {
  CATALOGUE,
  CATEGORIES,
  CHANNEL_APPS,
  INSTALLED_OTHER,
  tintFor,
  type App,
  type Installed,
} from "@/lib/apps/data";
import { interpolate } from "@/lib/i18n";
import type { Locale } from "@/lib/locales";

import type { AppsDictionary } from "./page";

function Mark({ id, glyph, size = 40 }: { id: string; glyph: string; size?: number }) {
  const tint = tintFor(id);
  return (
    <span
      className="inline-flex flex-none items-center justify-center rounded-[10px] border font-semibold"
      style={{
        width: size,
        height: size,
        fontSize: size > 38 ? 14.5 : 15,
        borderColor: tint.border,
        background: tint.background,
        color: tint.color,
      }}
    >
      {glyph}
    </span>
  );
}

function LinkButton({ label, tone }: { label: string; tone?: "strong" | "danger" }) {
  return (
    <button
      type="button"
      className="cursor-pointer border-none bg-transparent p-0 text-start text-[13px] hover:underline"
      style={{
        color:
          tone === "danger"
            ? "var(--od-red-text-4)"
            : tone === "strong"
              ? "var(--od-text-3)"
              : "var(--od-muted-4)",
      }}
    >
      {label}
    </button>
  );
}

export function Apps({ locale, t }: { locale: Locale; t: AppsDictionary }) {
  const [state, setState] = useState<ScreenState>("default");
  const [tab, setTab] = useState<"installed" | "store">("installed");
  const [category, setCategory] = useState("all");

  /** An installed entry names itself in copy or keeps a product's own name. */
  const nameOf = (entry: Installed | App) =>
    entry.name ? t[entry.name] : (entry.nameText ?? "");

  const offline = state === "offline";
  const empty = state === "empty";
  const showBody = state === "default" || empty || offline;

  const channels = empty ? CHANNEL_APPS.slice(0, 1) : CHANNEL_APPS;
  const storeApps = CATALOGUE.filter((entry) => entry.install !== "installed");
  const shown = storeApps.filter((entry) => category === "all" || entry.category === category);
  const sections = CATEGORIES.filter((entry) => category === "all" || category === entry.id)
    .map((entry) => ({
      ...entry,
      apps: shown.filter((app) => app.category === entry.id),
    }))
    .filter((section) => section.apps.length > 0);

  return (
    <div className="bg-od-canvas text-od-text-2 min-h-dvh text-[14px] leading-[1.45] ps-[224px]">
      <div className="fixed inset-y-0 start-0 z-50 h-dvh w-[224px]">
        <Sidebar locale={locale} active="settings" />
      </div>

      <StatePreview state={state} onChange={setState} />

      {offline ? (
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
              <span className="mono">09:58</span>
              {t.offline_body_after}
            </div>
          </div>
          <button
            type="button"
            className="border-od-red-border-2 bg-od-red-bg-2 hover:bg-od-red-bg-3 cursor-pointer rounded-md border p-[9px_15px] font-medium text-[color:var(--od-red-text-3)]"
          >
            {t.offline_retry}
          </button>
        </div>
      ) : null}

      <div className="mx-auto max-w-[1320px] p-[26px_28px_80px]">
        {state === "error" ? <AppCrashed t={t} /> : null}

        {state === "loading" ? (
          <div>
            <div
              className="h-7 w-[180px] rounded-md"
              style={{
                background:
                  "linear-gradient(90deg,var(--od-raise-4),var(--od-raise-13),var(--od-raise-4))",
                backgroundSize: "420px 100%",
                animation: "od-shimmer 1.4s linear infinite",
              }}
            />
            <div className="mt-6 flex flex-col gap-3">
              {[0, 1, 2].map((index) => (
                <div
                  key={index}
                  className="border-od-raise-12 h-24 rounded-[10px] border"
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

        {showBody ? (
          <div>
            <div className="flex flex-wrap items-end justify-between gap-x-5 gap-y-[14px]">
              <div className="max-w-[66ch]">
                <h1 className="text-od-text m-0 text-[26px] font-semibold tracking-[-0.02em]">{t.title}</h1>
                <p className="text-od-muted-4 mt-[6px] text-pretty">{t.intro}</p>
              </div>
              <a
                href="#"
                className="border-od-border-2 text-od-muted rounded-md border p-[9px_15px] text-[13px] whitespace-nowrap"
              >
                {t.install_from_file}
              </a>
            </div>

            <div className="border-od-border mt-[22px] flex flex-wrap gap-1 border-b">
              {(
                [
                  ["installed", "tab_installed", channels.length + INSTALLED_OTHER.length],
                  ["store", "tab_store", storeApps.length],
                ] as const
              ).map(([id, label, count]) => {
                const on = tab === id;
                return (
                  <button
                    key={id}
                    type="button"
                    onClick={() => setTab(id)}
                    className="-mb-px inline-flex cursor-pointer items-center gap-2 border-none bg-transparent p-[10px_15px] text-[13.5px]"
                    style={{
                      borderBottom: `2px solid ${on ? "var(--od-text)" : "transparent"}`,
                      color: on ? "var(--od-text)" : "var(--od-muted-4)",
                      fontWeight: on ? 600 : 400,
                    }}
                  >
                    <span>{t[label]}</span>
                    <span
                      dir="ltr"
                      className="mono border-od-line rounded-full border p-[1px_7px] text-[11.5px]"
                      style={{
                        background: on ? "var(--od-raise-7)" : "var(--od-panel-deep-3)",
                        color: on ? "var(--od-text-3)" : "var(--od-faint)",
                      }}
                    >
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>

            {tab === "installed" ? (
              <section className="mt-[22px]">
                <div className="flex flex-col gap-3">
                  {channels.map((channel) => {
                    const live = !(offline && channel.breaksWhenOffline);
                    return (
                      <div
                        key={channel.id}
                        className="rounded-[10px] border p-4"
                        style={{
                          borderColor: live ? "var(--od-line)" : "var(--od-red-border-3)",
                          background: live ? "var(--od-panel-deep-3)" : "var(--od-red-bg-4)",
                        }}
                      >
                        <div className="flex flex-wrap items-start gap-x-5 gap-y-[14px]">
                          <Mark id={channel.id} glyph={channel.mark} size={38} />
                          <div className="min-w-[240px] flex-[1_1_300px]">
                            <div className="flex flex-wrap items-center gap-[10px]">
                              <span className="text-od-text text-[16px] font-semibold">
                                {nameOf(channel)}
                              </span>
                              <span
                                className="rounded-md border p-[3px_10px] text-[12.5px] font-medium whitespace-nowrap"
                                style={{
                                  borderColor: live
                                    ? "var(--od-green-border)"
                                    : "var(--od-red-border)",
                                  background: live
                                    ? "rgba(63,185,132,.11)"
                                    : "rgba(240,96,94,.11)",
                                  color: live
                                    ? "var(--od-green-text)"
                                    : "var(--od-red-text-4)",
                                }}
                              >
                                {live ? t.live : t.disconnected}
                              </span>
                            </div>
                            <div className="text-od-faint mt-1 text-[12.5px]">
                              <span dir="ltr" className="mono ltr-data">
                                {channel.version}
                              </span>
                              <span>
                                {" · "}
                                {interpolate(t.by_author, {
                                  author: channel.authorId
                                    ? `${t[channel.author]} · ${channel.authorId}`
                                    : t[channel.author],
                                })}
                              </span>
                            </div>
                            <div className="text-od-muted-5 mt-[6px] text-[13px] text-pretty">
                              {t[channel.detail]}
                            </div>
                          </div>
                          <div className="ms-auto flex flex-wrap items-center justify-end gap-[10px]">
                            <LinkButton label={t.settings} />
                            <LinkButton label={live ? t.deactivate : t.reconnect} tone="strong" />
                            <LinkButton label={t.delete} tone="danger" />
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {empty ? (
                  <div className="border-od-border-6 bg-od-panel-deep-2 mt-3 rounded-[10px] border border-dashed p-[34px_28px]">
                    <h3 className="m-0 text-[18px] font-semibold">{t.empty_title}</h3>
                    <p className="text-od-muted mt-[10px] max-w-[60ch] text-pretty">{t.empty_body}</p>
                    <button
                      type="button"
                      onClick={() => setTab("store")}
                      className="border-od-stroke bg-od-raise-10 text-od-text-2 hover:bg-od-border-3 mt-[18px] cursor-pointer rounded-md border p-[9px_16px] font-medium"
                    >
                      {t.empty_browse}
                    </button>
                  </div>
                ) : null}

                <div className="mt-3 flex flex-col gap-3">
                  {INSTALLED_OTHER.map((entry) => (
                    <div
                      key={entry.id}
                      className="border-od-line bg-od-panel-deep-3 flex flex-wrap items-center gap-x-[18px] gap-y-3 rounded-[10px] border p-4"
                    >
                      <Mark id={entry.id} glyph={entry.mark} size={38} />
                      <div className="min-w-[220px] flex-[1_1_280px]">
                        <div className="flex flex-wrap items-center gap-[9px]">
                          <span className="text-od-text text-[15px] font-semibold">
                            {nameOf(entry)}
                          </span>
                          <span
                            className="rounded-md border p-[2px_9px] text-[12px] font-medium"
                            style={{
                              borderColor: entry.active
                                ? "var(--od-green-border)"
                                : "var(--od-border-7)",
                              background: entry.active
                                ? "rgba(63,185,132,.11)"
                                : "var(--od-raise-5)",
                              color: entry.active ? "var(--od-green-text)" : "var(--od-faint)",
                            }}
                          >
                            {entry.active ? t.active : t.inactive}
                          </span>
                        </div>
                        <div className="text-od-faint mt-1 text-[12.5px]">
                          <span dir="ltr" className="mono ltr-data">
                            {entry.version}
                          </span>
                          <span>
                            {" · "}
                            {interpolate(t.by_author, {
                              author: entry.authorId
                                ? `${t[entry.author]} · ${entry.authorId}`
                                : t[entry.author],
                            })}
                          </span>
                        </div>
                        <div className="text-od-muted-5 mt-[6px] text-[13px] text-pretty">
                          {t[entry.role]}
                        </div>
                      </div>
                      <div className="ms-auto flex flex-wrap items-center justify-end gap-[10px]">
                        <LinkButton label={t.settings} />
                        <LinkButton label={entry.active ? t.deactivate : t.activate} tone="strong" />
                        <LinkButton label={t.delete} tone="danger" />
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            ) : null}

            {tab === "store" ? (
              <section className="mt-[22px]">
                <div className="mb-[14px] flex flex-wrap items-baseline justify-between gap-x-4 gap-y-[10px]">
                  <p className="text-od-muted-4 m-0 max-w-[62ch] text-[13px] text-pretty">{t.store_note}</p>
                  <span className="text-od-faint text-[12.5px]">
                    {interpolate(t.store_count, { shown: shown.length, total: storeApps.length })}
                  </span>
                </div>

                {/* The point of the whole catalogue: nobody waits on us to write a connector. */}
                <div className="mb-4 flex flex-wrap items-center justify-between gap-x-5 gap-y-3 rounded-[10px] border border-[color:var(--od-violet-border)] bg-[rgba(139,124,255,.06)] p-[14px_16px]">
                  <div className="min-w-[280px] flex-[1_1_400px]">
                    <div className="text-od-text font-semibold">{t.mcp_title}</div>
                    <div className="text-od-muted-2 mt-1 max-w-[78ch] text-[13px] text-pretty">
                      {t.mcp_body_before}
                      <span className="font-medium text-[color:var(--od-violet-3)]">{t.install_mcp}</span>
                      {t.mcp_body_after}
                    </div>
                  </div>
                  <Link
                    href={`/${locale}/connectors`}
                    className="text-od-violet text-[13px] whitespace-nowrap hover:underline"
                  >
                    {t.mcp_link}
                  </Link>
                </div>

                <div className="mb-[14px] flex flex-wrap items-center gap-x-[14px] gap-y-[10px]">
                  <div className="border-od-border-6 bg-od-canvas-2 flex min-w-[220px] flex-[1_1_260px] items-center gap-[9px] rounded-lg border p-[9px_13px]">
                    <span className="text-od-faint-2 text-[13px] leading-none">⌕</span>
                    <span className="text-od-faint-2 text-[13.5px]">
                      {interpolate(t.search_placeholder, { total: CATALOGUE.length })}
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {[{ id: "all", label: "filter_all" as const }, ...CATEGORIES].map((entry) => (
                      <button
                        key={entry.id}
                        type="button"
                        onClick={() => setCategory(entry.id)}
                        className={`cursor-pointer rounded-full border p-[6px_12px] text-[13px] whitespace-nowrap ${
                          category === entry.id
                            ? "border-od-stroke bg-od-line-2 text-od-text"
                            : "border-od-border-7 bg-od-panel-deep-3 text-od-muted-4"
                        }`}
                      >
                        {t[entry.label]}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex flex-col gap-[26px]">
                  {sections.map((section) => (
                    <div key={section.id}>
                      <div className="border-od-border mb-[14px] flex flex-wrap items-baseline justify-between gap-x-4 gap-y-[10px] border-b pb-[10px]">
                        <h2 className="text-od-text m-0 text-[16px] font-semibold">{t[section.label]}</h2>
                        <span className="text-od-faint text-[12.5px] text-pretty">{t[section.note]}</span>
                      </div>
                      <div
                        className="grid items-stretch gap-[14px]"
                        style={{ gridTemplateColumns: "repeat(auto-fill, minmax(268px, 1fr))" }}
                      >
                        {section.apps.map((entry) => (
                          <AppCard key={entry.id} t={t} app={entry} />
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            ) : null}

            <div className="border-od-line bg-od-panel-deep-2 mt-6 flex flex-wrap items-center justify-between gap-x-5 gap-y-3 rounded-[10px] border p-[14px_16px]">
              <div className="max-w-[74ch] min-w-0">
                <div className="text-od-text-5 font-medium">{t.write_title}</div>
                <div className="text-od-muted-5 mt-[3px] text-[13px] text-pretty">{t.write_body}</div>
              </div>
              <a href="#" className="text-od-violet text-[13px] hover:underline">
                {t.write_link}
              </a>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}

const INSTALL_LABEL = {
  installed: "install_installed",
  install: "install_install",
  planned: "install_planned",
  mcp: "install_mcp",
} as const;

const ORIGIN_LABEL = {
  official: "origin_official",
  community: "origin_community",
  planned: "origin_planned",
  mcp: "origin_mcp",
} as const;

function AppCard({ t, app }: { t: AppsDictionary; app: App }) {
  const planned = app.install === "planned";
  const viaMcp = app.install === "mcp";

  return (
    <div
      className="flex min-w-0 flex-col gap-[10px] rounded-[10px] p-4"
      style={{
        border: planned ? "1px dashed var(--od-border-7)" : "1px solid var(--od-line)",
        background: planned ? "transparent" : "var(--od-panel-deep-3)",
      }}
    >
      <div className="flex flex-wrap items-start gap-3">
        <Mark id={app.id} glyph={app.mark} />
        <div className="min-w-[140px] flex-[1_1_160px]">
          <div className="text-od-text text-[15px] font-semibold text-pretty">
            {app.name ? t[app.name] : app.nameText}
          </div>
          {/* Category and origin are copy; the version and size are not. */}
          <div className="text-od-faint mt-[3px] text-[11.5px]">
            {`${t[CATEGORIES.find((entry) => entry.id === app.category)!.label]} · ${t[ORIGIN_LABEL[app.origin]]}`}
            {app.eta ? ` · ${t[app.eta]}` : null}
            {app.version ? (
              <>
                {" · "}
                <span dir="ltr" className="mono ltr-data">
                  {app.version}
                </span>
              </>
            ) : null}
          </div>
        </div>
      </div>

      <div className="text-od-muted-2 text-[13px] text-pretty">{t[app.desc]}</div>

      {app.warn ? (
        <div className="text-[12.5px] text-pretty text-[color:var(--od-amber-text)]">{t[app.warn]}</div>
      ) : null}

      <button
        type="button"
        disabled={planned}
        className="mt-auto w-full rounded-[7px] p-[9px_13px] text-[13px] font-medium whitespace-nowrap"
        style={{
          cursor: planned ? "default" : "pointer",
          border: viaMcp
            ? "1px solid var(--od-violet-border)"
            : planned
              ? "1px solid transparent"
              : "1px solid var(--od-stroke)",
          background: viaMcp
            ? "rgba(139,124,255,.10)"
            : planned
              ? "var(--od-raise-4)"
              : "var(--od-raise-10)",
          color: viaMcp
            ? "var(--od-violet-3)"
            : planned
              ? "var(--od-faint)"
              : "var(--od-text-2)",
        }}
      >
        {t[INSTALL_LABEL[app.install]]}
      </button>
    </div>
  );
}

function AppCrashed({ t }: { t: AppsDictionary }) {
  return (
    <div className="flex justify-center py-20">
      <div className="border-od-border-9 bg-od-panel w-full max-w-[560px] rounded-xl border p-8">
        <div className="border-od-red-border bg-od-red-bg inline-flex items-center gap-2 rounded-md border p-[5px_10px] text-[12px] font-semibold text-[color:var(--od-red-text)]">
          {t.error_label}
        </div>
        <h2 className="mt-[18px] mb-0 text-[21px] font-semibold">{t.error_title}</h2>
        <p className="text-od-muted mt-[10px] max-w-[46ch] text-pretty">{t.error_body}</p>
        <div
          dir="ltr"
          className="border-od-border-2 bg-od-canvas-2 mono ltr-data text-od-text-5 mt-[18px] rounded-lg border p-[12px_14px] text-[12.5px]"
        >
          telegram-channel v0.9.1 —{" "}
          <span className="text-[color:var(--od-red-text-5)]">{t.error_exit}</span>
        </div>
        <div className="mt-5 flex flex-wrap gap-[10px]">
          <button
            type="button"
            className="border-od-stroke bg-od-raise-10 text-od-text-2 hover:bg-od-border-3 cursor-pointer rounded-md border p-[9px_16px] font-medium"
          >
            {t.error_disable}
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
