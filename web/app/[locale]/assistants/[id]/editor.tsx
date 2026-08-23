"use client";

import Link from "next/link";
import { useState } from "react";

import { Sidebar } from "@/components/shell/sidebar";
import { StatePreview, type ScreenState } from "@/components/state-preview";
import {
  GENERIC,
  GROUPS,
  HOOKS,
  OPENING_LINES,
  PANEL_META,
  PROMPT_TEMPLATES,
  PROMPT_TEXT,
  SOURCES,
  TECHNICAL,
  type PanelId,
  type RailRow,
} from "@/lib/editor/data";
import { interpolate } from "@/lib/i18n";
import type { Locale } from "@/lib/locales";

import type { EditorDictionary } from "./page";

const ICONS: Record<string, string> = {
  cube: "M12 2 3 7v10l9 5 9-5V7l-9-5Z M3 7l9 5 9-5 M12 12v10",
  help: "M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20Z M9.1 9a3 3 0 1 1 4.5 2.6c-.9.5-1.6 1.2-1.6 2.4 M12 17.5h.01",
  forward: "M4 4h4l2 5-2.5 1.5a11 11 0 0 0 5.5 5.5L15 14l5 2v4a12 12 0 0 1-16-16Z M16 3h5v5",
  mail: "M3 6h18v12H3V6Z M3 7l9 6 9-6",
  contact: "M4 3h16v18H4V3Z M12 11a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5Z M8 17c0-2.2 1.8-3.5 4-3.5s4 1.3 4 3.5",
  spark: "M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8L12 3Z",
  sms: "M4 5h16v10H9l-5 4V5Z",
  calendar: "M4 6h16v15H4V6Z M4 10h16 M9 3v4 M15 3v4",
  webhook: "M9 8a3.5 3.5 0 1 1 5 3.2L11.5 16 M15.5 12.5a3.5 3.5 0 1 1-1 6.5H8 M8.5 12 6 16.5a3.5 3.5 0 1 0 4.5 4.5",
  plug: "M9 3v6 M15 3v6 M6 9h12v3a6 6 0 0 1-12 0V9Z M12 18v3",
};

function Icon({ name, color }: { name: string; color: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      width={17}
      height={17}
      fill="none"
      stroke={color}
      strokeWidth={1.6}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {(ICONS[name] ?? ICONS.cube).split(" M").map((segment, index) => (
        <path key={index} d={(index ? "M" : "") + segment} />
      ))}
    </svg>
  );
}

function Toggle({ on }: { on: boolean }) {
  return (
    <span
      className="inline-flex h-[22px] w-10 flex-none cursor-pointer items-center rounded-full border p-[2px]"
      style={{
        borderColor: on ? "var(--od-violet)" : "var(--od-border-7)",
        background: on ? "var(--od-violet)" : "var(--od-raise)",
        justifyContent: on ? "flex-end" : "flex-start",
      }}
    >
      <span
        className="block size-4 rounded-full"
        style={{ background: on ? "#fff" : "var(--od-stroke-5)" }}
      />
    </span>
  );
}

export function AssistantEditor({ locale, t }: { locale: Locale; t: EditorDictionary }) {
  const [state, setState] = useState<ScreenState>("default");
  const [tab, setTab] = useState<"behaviour" | "technical">("behaviour");
  const [panel, setPanel] = useState<PanelId>("persona");
  const [sourcesOn, setSourcesOn] = useState<string[]>(
    SOURCES.filter((entry) => entry.on).map((entry) => entry.id),
  );
  const [interrupt, setInterrupt] = useState(true);

  const offline = state === "offline";
  const loading = state === "loading";
  const meta = PANEL_META[panel];
  const generic = GENERIC[panel];

  return (
    <div className="bg-od-canvas text-od-text-2 min-h-dvh text-[14px] leading-[1.45] ps-[224px]">
      <div className="fixed inset-y-0 start-0 z-50 h-dvh w-[224px]">
        <Sidebar locale={locale} active="assistants" />
      </div>

      <StatePreview state={state} onChange={setState} states={["default", "loading", "offline"]} />

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
            <div className="mt-[3px] text-[color:var(--od-red-text-2)]">{t.offline_body}</div>
          </div>
        </div>
      ) : null}

      <div className="mx-auto max-w-[1180px] p-[26px_28px_140px]">
        {loading ? (
          <div>
            <div
              className="h-[30px] w-[220px] rounded-md"
              style={{
                background:
                  "linear-gradient(90deg,var(--od-raise-4),var(--od-raise-13),var(--od-raise-4))",
                backgroundSize: "420px 100%",
                animation: "od-shimmer 1.4s linear infinite",
              }}
            />
            <div className="mt-[30px] flex flex-col gap-[10px]">
              {[0, 1, 2, 3, 4, 5, 6].map((index) => (
                <div
                  key={index}
                  className="border-od-raise-12 h-[58px] rounded-[10px] border"
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
        ) : (
          <div>
            <div className="flex flex-wrap items-start justify-between gap-x-5 gap-y-[14px]">
              <div className="flex min-w-0 items-start gap-3">
                <Link
                  href={`/${locale}/assistants`}
                  aria-label={t.back}
                  className="border-od-border-2 bg-od-panel text-od-muted-4 hover:bg-od-raise hover:text-od-text mt-[3px] inline-flex size-8 flex-none items-center justify-center rounded-lg border hover:no-underline"
                >
                  ←
                </Link>
                <div className="min-w-0">
                  <h1 className="text-od-text m-0 text-[26px] font-semibold tracking-[-0.02em]">
                    {t.title}
                  </h1>
                  <div className="text-od-muted-4 mt-[3px]">
                    {interpolate(t.subtitle, { name: "Carla", business: "Wagner & Partner" })}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-od-muted-5 text-[13px]">{t.saved_ago}</span>
                <button
                  type="button"
                  aria-label={t.more}
                  className="border-od-border-2 bg-od-panel text-od-muted-4 hover:bg-od-raise hover:text-od-text inline-flex size-8 cursor-pointer items-center justify-center rounded-lg border"
                >
                  ⋯
                </button>
              </div>
            </div>

            <div className="border-od-border mt-[22px] flex gap-1 border-b">
              {(
                [
                  ["behaviour", "tab_behaviour"],
                  ["technical", "tab_technical"],
                ] as const
              ).map(([id, label]) => {
                const on = tab === id;
                return (
                  <button
                    key={id}
                    type="button"
                    onClick={() => setTab(id)}
                    className="-mb-px me-[18px] cursor-pointer border-none bg-transparent p-[10px_4px] text-[15px]"
                    style={{
                      fontWeight: on ? 600 : 400,
                      color: on ? "var(--od-text)" : "var(--od-muted-4)",
                      borderBottom: `2px solid ${on ? "var(--od-text-5)" : "transparent"}`,
                    }}
                  >
                    {t[label]}
                  </button>
                );
              })}
            </div>

            {tab === "behaviour" ? (
              <div className="mt-[26px] flex flex-wrap items-start gap-6">
                <div className="flex max-w-[340px] min-w-[min(100%,280px)] flex-[1_1_300px] flex-col gap-5">
                  {GROUPS.map((group) => (
                    <div key={group.id} className="flex flex-col gap-[10px]">
                      <div className="pb-[2px]">
                        <div className="text-od-faint text-[12px] font-semibold tracking-[.08em] uppercase">
                          {t[group.label]}
                        </div>
                        <div className="text-od-faint-2 mt-[3px] text-[12px] text-pretty">
                          {t[group.note]}
                        </div>
                      </div>

                      {group.rows.map((row) => (
                        <RailRowView
                          key={row.panel}
                          t={t}
                          row={row}
                          selected={panel === row.panel}
                          onOpen={() => setPanel(row.panel)}
                        />
                      ))}
                    </div>
                  ))}
                </div>

                <div className="min-w-[min(100%,420px)] flex-[3_1_460px]">
                  <div className="border-od-line bg-od-panel overflow-hidden rounded-xl border">
                    <div className="border-od-border flex flex-wrap items-start justify-between gap-x-4 gap-y-[10px] border-b p-[18px_20px_14px]">
                      <div className="min-w-0 flex-[1_1_240px]">
                        <h2 className="text-od-text m-0 text-[19px] font-semibold tracking-[-0.01em] text-pretty">
                          {t[meta.title]}
                        </h2>
                        <p className="text-od-muted-4 mt-[6px] max-w-[60ch] text-[13px] text-pretty">
                          {t[meta.blurb]}
                        </p>
                      </div>
                    </div>

                    {panel === "persona" ? (
                      <PersonaPanel t={t} interrupt={interrupt} onInterrupt={setInterrupt} />
                    ) : null}

                    {panel === "knowledge" ? (
                      <KnowledgePanel
                        locale={locale}
                        t={t}
                        on={sourcesOn}
                        onToggle={(id) =>
                          setSourcesOn((current) =>
                            current.includes(id)
                              ? current.filter((entry) => entry !== id)
                              : [...current, id],
                          )
                        }
                      />
                    ) : null}

                    {panel === "instructions" ? <InstructionsPanel t={t} /> : null}
                    {panel === "webhooks" ? <WebhooksPanel t={t} /> : null}

                    {generic ? <GenericPanel t={t} sections={generic} /> : null}
                  </div>
                </div>
              </div>
            ) : (
              <TechnicalTab t={t} />
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function RailRowView({
  t,
  row,
  selected,
  onOpen,
}: {
  t: EditorDictionary;
  row: RailRow;
  selected: boolean;
  onOpen: () => void;
}) {
  const enabled = row.enabled !== false;

  return (
    <div
      onClick={onOpen}
      className="hover:bg-od-raise flex cursor-pointer flex-nowrap items-center gap-3 rounded-[10px] p-[13px_15px]"
      style={{
        border: selected
          ? "1px solid var(--od-violet-border)"
          : enabled
            ? "1px solid var(--od-line)"
            : "1px dashed var(--od-border-7)",
        background: selected
          ? "rgba(139,124,255,.10)"
          : enabled
            ? "var(--od-panel-deep-3)"
            : "transparent",
      }}
    >
      <span
        className="inline-flex size-[30px] flex-none items-center justify-center rounded-lg border"
        style={{
          borderColor: enabled ? "var(--od-border-6)" : "transparent",
          background: enabled ? "var(--od-raise-5)" : "var(--od-raise)",
        }}
      >
        <Icon name={row.icon} color={enabled ? "var(--od-muted-4)" : "var(--od-faint-2)"} />
      </span>

      <div className="min-w-0 flex-[1_1_0]">
        <div className="flex flex-wrap items-center gap-[9px]">
          <span
            className="text-[15px] font-semibold text-pretty"
            style={{
              color: selected
                ? "var(--od-text)"
                : enabled
                  ? "var(--od-text-3)"
                  : "var(--od-muted-4)",
            }}
          >
            {t[row.title]}
          </span>
          {row.isNew ? (
            <span className="rounded-full border border-[color:var(--od-violet-border)] bg-[rgba(139,124,255,.16)] p-[2px_8px] text-[10.5px] font-bold tracking-[.06em] text-[color:var(--od-violet-3)]">
              {t.new_badge}
            </span>
          ) : null}
        </div>
        {row.hint ? (
          <div className="text-od-faint-2 mt-[3px] text-[12px] text-pretty">{t[row.hint]}</div>
        ) : null}
        {row.value || row.valueText ? (
          <div className="text-od-muted-5 mt-[4px] text-[12.5px]">
            {row.value ? t[row.value] : row.valueText}
          </div>
        ) : null}
      </div>

      {/* An unconfigured capability offers a green plus, not a chevron into an empty panel. */}
      {enabled ? (
        <span className="text-od-faint-2 w-[22px] flex-none text-center text-[18px] leading-none">
          ›
        </span>
      ) : (
        <span className="inline-flex size-[22px] flex-none items-center justify-center rounded-full bg-[color:var(--od-green)] text-[15px] leading-none font-bold text-[#08130E]">
          +
        </span>
      )}
    </div>
  );
}

function PanelFooter({ t }: { t: EditorDictionary }) {
  return (
    <div className="border-od-border flex flex-wrap justify-end gap-[10px] border-t pt-[14px]">
      <button
        type="button"
        className="border-od-border-2 text-od-muted hover:text-od-text-2 cursor-pointer rounded-[7px] border bg-transparent p-[9px_15px] whitespace-nowrap"
      >
        {t.cancel}
      </button>
      <button
        type="button"
        className="border-od-stroke bg-od-raise-10 text-od-text-2 hover:bg-od-border-3 inline-flex cursor-pointer items-center gap-[9px] rounded-[7px] border p-[9px_16px] font-semibold whitespace-nowrap"
      >
        {t.save}
      </button>
    </div>
  );
}

function GenericPanel({
  t,
  sections,
}: {
  t: EditorDictionary;
  sections: NonNullable<(typeof GENERIC)[PanelId]>;
}) {
  return (
    <div className="flex flex-col gap-4 p-[20px_24px_28px]">
      {sections.map((section) => (
        <div
          key={section.id}
          className="border-od-line bg-od-panel-deep-3 overflow-hidden rounded-[10px] border"
        >
          <div className="border-od-border flex flex-wrap items-baseline justify-between gap-x-[14px] gap-y-1 border-b p-[13px_16px]">
            <span className="text-od-text-3 text-[13px] font-semibold">{t[section.label]}</span>
            {section.meta ? (
              <span className="text-od-faint text-[12px]">{t[section.meta]}</span>
            ) : null}
          </div>

          {section.rows.map((row) => {
            return (
              <div
                key={row.id}
                className="flex flex-wrap items-center gap-x-4 gap-y-3 border-b border-[color:var(--od-raise-6)] p-[13px_16px]"
              >
                <div className="min-w-[170px] flex-[1_1_200px]">
                  <div className="text-od-text-3 font-medium text-pretty">
                    {row.label ? t[row.label] : row.labelText}
                  </div>
                  {row.help || row.helpText ? (
                    <div className="text-od-muted-5 mt-[3px] max-w-[52ch] text-[12.5px] text-pretty">
                      {row.help ? t[row.help] : row.helpText}
                    </div>
                  ) : null}
                </div>

                {row.value.kind === "toggle" ? (
                  <Toggle on={row.value.on} />
                ) : row.value.kind === "add" ? (
                  <button
                    type="button"
                    className="border-od-stroke-3 text-od-muted-5 hover:text-od-text-2 hover:border-od-faint-3 flex-none cursor-pointer rounded-[7px] border border-dashed bg-transparent p-[7px_12px] text-[12.5px] whitespace-nowrap"
                  >
                    {t.set_up}
                  </button>
                ) : row.value.kind === "data" ? (
                  <span
                    dir="ltr"
                    className="mono ltr-data border-od-border-6 bg-od-canvas-2 text-od-text-2 min-w-[min(100%,180px)] flex-[0_1_220px] rounded-[7px] border p-[8px_11px] text-[12.5px] [overflow-wrap:anywhere]"
                  >
                    {row.value.text}
                  </span>
                ) : (
                  <span className="border-od-border-6 bg-od-canvas-2 text-od-text-2 min-w-[min(100%,180px)] flex-[0_1_220px] rounded-[7px] border p-[8px_11px] text-[12.5px] [overflow-wrap:anywhere]">
                    {t[row.value.key]}
                  </span>
                )}
              </div>
            );
          })}

          {section.notes?.map((note) => (
            <div
              key={note}
              className="border-od-border text-od-muted border-t p-[12px_16px] text-[12.5px] text-pretty"
            >
              {t[note]}
            </div>
          ))}
        </div>
      ))}

      <PanelFooter t={t} />
    </div>
  );
}

function PersonaPanel({
  t,
  interrupt,
  onInterrupt,
}: {
  t: EditorDictionary;
  interrupt: boolean;
  onInterrupt: (value: boolean) => void;
}) {
  return (
    <div className="flex flex-col gap-5 p-[20px_22px_24px]">
      <label className="flex flex-col gap-[7px]">
        <span className="text-od-text-3 text-[13px] font-medium">{t.p_name}</span>
        <input
          defaultValue="Carla"
          className="border-od-border-6 bg-od-canvas-2 text-od-text-2 rounded-[7px] border p-[10px_12px] text-[14px]"
        />
      </label>

      <div className="flex flex-wrap gap-[14px]">
        <div className="flex min-w-[180px] flex-[1_1_200px] flex-col gap-[7px]">
          <span className="text-od-text-3 text-[13px] font-medium">{t.p_voice}</span>
          <button
            type="button"
            className="border-od-border-6 bg-od-canvas-2 text-od-text-2 hover:border-od-stroke flex cursor-pointer items-center gap-[10px] rounded-[7px] border p-[8px_12px] text-[14px]"
          >
            <span className="border-od-border-9 text-od-text-3 inline-flex size-[26px] flex-none items-center justify-center rounded-full border bg-[var(--od-raise-5)] text-[12px] font-semibold">
              L
            </span>
            <span className="min-w-0 flex-[1_1_auto] text-start">{t.p_voice_value}</span>
            <span className="text-od-faint-2 flex-none text-[11px]">⌄</span>
          </button>
        </div>
        <label className="flex min-w-[180px] flex-[1_1_200px] flex-col gap-[7px]">
          <span className="text-od-text-3 text-[13px] font-medium">{t.p_language}</span>
          <select
            defaultValue="de-AT"
            className="border-od-border-6 bg-od-canvas-2 text-od-text-2 rounded-[7px] border p-[10px_12px] text-[14px]"
          >
            <option value="de-AT">{t.lang_de_at}</option>
            <option value="de-DE">{t.lang_de_de}</option>
            <option value="en-GB">{t.lang_en_gb}</option>
          </select>
        </label>
      </div>

      <label className="flex max-w-[280px] flex-col gap-[7px]">
        <span className="text-od-text-3 text-[13px] font-medium">{t.p_address}</span>
        <select
          defaultValue="formal"
          className="border-od-border-6 bg-od-canvas-2 text-od-text-2 rounded-[7px] border p-[10px_12px] text-[14px]"
        >
          <option value="formal">{t.opt_formal}</option>
          <option value="informal">{t.opt_informal}</option>
          <option value="prompt">{t.opt_prompt}</option>
        </select>
      </label>

      <div>
        <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-[10px]">
          <span className="text-od-text-3 text-[13px] font-medium">{t.p_opening}</span>
          {/* Barge-in: the caller talking over the greeting stops it. */}
          <span className="flex items-center gap-[9px]">
            <span className="text-od-muted-5 text-[12.5px]">{t.p_interrupt}</span>
            <span onClick={() => onInterrupt(!interrupt)}>
              <Toggle on={interrupt} />
            </span>
          </span>
        </div>

        <div className="border-od-border-6 bg-od-canvas-2 mt-[9px] overflow-hidden rounded-lg border">
          {OPENING_LINES.map((line, index) => (
            <div
              key={line.id}
              className={`flex flex-wrap items-center gap-x-4 gap-y-3 p-[12px_14px] ${
                index === 0 ? "" : "border-t border-[color:var(--od-raise-6)]"
              }`}
            >
              <div className="min-w-[180px] flex-[1_1_220px]">
                <div className="text-od-faint-2 text-[11.5px] tracking-[.06em] uppercase">
                  {t[line.tag]}
                </div>
                {/* What the assistant says is content, so it is not translated. */}
                <div dir="ltr" className="text-od-text-2 mt-[5px] text-start text-pretty">
                  {line.text}
                </div>
              </div>
              <button
                type="button"
                className="border-od-border-7 text-od-muted-4 hover:text-od-text-2 flex-none cursor-pointer rounded-md border bg-transparent p-[6px_11px] text-[12.5px] hover:bg-[var(--od-raise-4)]"
              >
                {t.edit}
              </button>
            </div>
          ))}
        </div>

        <button
          type="button"
          className="border-od-stroke-3 text-od-muted-5 hover:text-od-text-2 hover:border-od-faint-3 mt-[9px] cursor-pointer rounded-[7px] border border-dashed bg-transparent p-[8px_13px] text-[13px]"
        >
          {t.p_add_line}
        </button>
      </div>

      <PanelFooter t={t} />
    </div>
  );
}

function KnowledgePanel({
  locale,
  t,
  on,
  onToggle,
}: {
  locale: Locale;
  t: EditorDictionary;
  on: string[];
  onToggle: (id: string) => void;
}) {
  return (
    <div className="flex flex-col gap-4 p-[20px_24px_28px]">
      <div className="border-od-line bg-od-panel-deep-3 overflow-hidden rounded-[10px] border">
        {SOURCES.map((source, index) => {
          const ticked = on.includes(source.id);
          return (
            <div
              key={source.id}
              onClick={() => onToggle(source.id)}
              className={`hover:bg-od-raise flex cursor-pointer flex-wrap items-center gap-x-4 gap-y-3 p-[13px_16px] ${
                index === 0 ? "" : "border-t border-[color:var(--od-raise-6)]"
              }`}
            >
              <span
                className="inline-flex size-[17px] flex-none items-center justify-center rounded-[5px] border text-[11px] leading-none font-bold text-white"
                style={{
                  borderColor: ticked ? "var(--od-violet)" : "var(--od-stroke-5)",
                  background: ticked ? "var(--od-violet)" : "transparent",
                }}
              >
                {ticked ? "✓" : ""}
              </span>
              <div className="min-w-[170px] flex-[1_1_200px]">
                <div className="flex flex-wrap items-center gap-[9px]">
                  <span
                    className="font-medium"
                    style={{ color: ticked ? "var(--od-text-3)" : "var(--od-muted-4)" }}
                  >
                    {source.name ? t[source.name] : source.nameText}
                  </span>
                  <span className="mono border-od-border-7 text-od-muted-2 rounded-[5px] border bg-[var(--od-raise-5)] p-[2px_7px] text-[11px]">
                    {source.kind}
                  </span>
                </div>
                <div className="text-od-muted-5 mt-[3px] text-[12.5px] text-pretty">
                  {t[source.meta]}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Hours are data every assistant shares — not a source you tick per assistant. */}
      <div className="border-od-line bg-od-panel-deep-2 rounded-[10px] border p-[14px_16px]">
        <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-[10px]">
          <span className="text-od-text-5 font-medium">{t.k_hours}</span>
          <span className="text-od-faint text-[12.5px]">{t.k_hours_meta}</span>
        </div>
        <div className="text-od-muted-5 mt-[5px] max-w-[60ch] text-[12.5px] text-pretty">
          {t.k_hours_note}
        </div>
        <Link
          href={`/${locale}/knowledge`}
          className="border-od-border-7 text-od-text-3 hover:text-od-text mt-[11px] inline-block rounded-[7px] border bg-transparent p-[7px_12px] text-[12.5px] whitespace-nowrap hover:bg-[var(--od-raise-4)] hover:no-underline"
        >
          {t.k_edit_hours}
        </Link>
      </div>

      <div className="flex flex-wrap gap-2">
        {(["k_upload", "k_crawl", "k_qa"] as const).map((label) => (
          <Link
            key={label}
            href={`/${locale}/knowledge`}
            className="border-od-stroke-3 text-od-muted-5 hover:text-od-text-2 hover:border-od-faint-3 rounded-[7px] border border-dashed bg-transparent p-[8px_14px] text-[13px] whitespace-nowrap hover:no-underline"
          >
            {t[label]}
          </Link>
        ))}
      </div>

      <div className="text-od-faint max-w-[70ch] text-[12.5px] text-pretty">{t.k_note}</div>
    </div>
  );
}

function InstructionsPanel({ t }: { t: EditorDictionary }) {
  return (
    <div className="flex flex-col gap-4 p-[20px_24px_28px]">
      <div className="flex flex-wrap gap-2">
        {PROMPT_TEMPLATES.map((template) => (
          <button
            key={template.id}
            type="button"
            className="border-od-border-7 text-od-muted-4 hover:text-od-text-2 cursor-pointer rounded-full border bg-transparent p-[7px_13px] text-[13px] whitespace-nowrap"
          >
            {t[template.label]}
          </button>
        ))}
      </div>

      {/* The customer writes this in the language their callers speak. */}
      <textarea
        dir="ltr"
        defaultValue={PROMPT_TEXT}
        className="border-od-border-6 bg-od-canvas-2 text-od-text-2 min-h-[300px] w-full resize-y rounded-lg border p-[15px_16px] text-start text-[13.5px] leading-[1.75]"
      />

      <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-[10px]">
        <span className="text-od-faint max-w-[52ch] text-[12.5px] text-pretty">{t.i_note}</span>
        <span dir="ltr" className="mono ltr-data text-od-faint-2 text-[12px]">
          412 / 2000
        </span>
      </div>

      <PanelFooter t={t} />
    </div>
  );
}

function WebhooksPanel({ t }: { t: EditorDictionary }) {
  return (
    <div className="flex flex-col gap-4 p-[20px_24px_28px]">
      <div className="border-od-line bg-od-panel-deep-3 overflow-hidden rounded-[10px] border">
        {HOOKS.map((hook, index) => (
          <div
            key={hook.name}
            className={`hover:bg-od-raise flex cursor-pointer flex-wrap items-center gap-x-4 gap-y-3 p-[13px_16px] ${
              index === 0 ? "" : "border-t border-[color:var(--od-raise-6)]"
            }`}
          >
            <div className="min-w-[150px] flex-[1_1_180px]">
              <div dir="ltr" className="mono text-od-text-3 text-start font-medium">
                {hook.name}
              </div>
              <div className="text-od-muted-5 mt-[3px] text-[12.5px] text-pretty">{t[hook.desc]}</div>
            </div>
            <div className="flex flex-wrap items-center gap-[6px]">
              {hook.badges.map((badge) => {
                const inbound = badge.inbound === true;
                return (
                  <span
                    key={badge.key}
                    className="rounded-[5px] border p-[2px_8px] text-[11.5px] font-medium whitespace-nowrap"
                    style={{
                      borderColor: inbound ? "var(--od-violet-border)" : "var(--od-border-7)",
                      background: inbound ? "rgba(139,124,255,.12)" : "var(--od-raise-5)",
                      color: inbound ? "var(--od-violet-3)" : "var(--od-muted-5)",
                    }}
                  >
                    {t[badge.key]}
                  </span>
                );
              })}
            </div>
            <span className="text-od-faint-2 flex-none text-[17px] leading-none">›</span>
          </div>
        ))}
      </div>

      {/* Rule 3 again: anything slower than ~2 s and the caller hears silence. */}
      <div className="border-od-line bg-od-panel-deep-2 text-od-muted rounded-[9px] border p-[13px_15px] text-[12.5px] text-pretty">
        {t.w_note}
      </div>

      <button
        type="button"
        className="border-od-stroke-3 text-od-muted-5 hover:text-od-text-2 hover:border-od-faint-3 cursor-pointer self-start rounded-[7px] border border-dashed bg-transparent p-[8px_14px] text-[13px] whitespace-nowrap"
      >
        {t.w_add}
      </button>
    </div>
  );
}

function TechnicalTab({ t }: { t: EditorDictionary }) {
  return (
    <div className="border-od-line bg-od-panel-deep-3 mt-[26px] rounded-[10px] border">
      {TECHNICAL.map((row, index) => (
        <div
          key={row.id}
          className={`flex flex-wrap items-start justify-between gap-x-6 gap-y-3 p-[14px_18px] ${
            index === 0 ? "" : "border-t border-[color:var(--od-raise-6)]"
          }`}
        >
          <div className="min-w-[200px] flex-[1_1_240px]">
            <div className="text-od-text-3 font-medium text-pretty">{t[row.label]}</div>
            <div className="text-od-muted-5 mt-1 max-w-[52ch] text-[12.5px] text-pretty">
              {t[row.help]}
            </div>
          </div>
          {/* A product name is data; the phrase after it is copy, so they are separate. */}
          <span className="border-od-border-6 bg-od-canvas-2 text-od-text-2 min-w-[min(100%,240px)] flex-[0_1_300px] rounded-[7px] border p-[9px_12px] text-[12.5px] [overflow-wrap:anywhere]">
            {row.valueKey ? (
              t[row.valueKey]
            ) : (
              <>
                <span className="mono">{row.valueText}</span>
                {row.suffix ? ` · ${t[row.suffix]}` : null}
              </>
            )}
          </span>
        </div>
      ))}
    </div>
  );
}
