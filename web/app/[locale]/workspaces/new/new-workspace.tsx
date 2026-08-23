"use client";

import Link from "next/link";
import { useState } from "react";

import { Sidebar } from "@/components/shell/sidebar";
import { StatePreview, type ScreenState } from "@/components/state-preview";
import { interpolate } from "@/lib/i18n";
import type { Locale } from "@/lib/locales";

import type { NewWorkspaceDictionary } from "./page";

/** The workspace this dialog was opened from, and how many people are already in it. */
const CURRENT_WORKSPACE = "Wagner & Partner";
const CURRENT_MEMBERS = 6;

const PART_KEYS = [
  "part_assistants",
  "part_catalogue",
  "part_routing",
  "part_knowledge",
  "part_hours",
] as const;

const PART_IDS = ["assistants", "catalogue", "routing", "knowledge", "hours"] as const;

/** Both the copy-parts chips and the access chips are the same control. */
function pillStyle(on: boolean) {
  return {
    borderColor: on ? "var(--od-violet-border)" : "var(--od-border-2)",
    background: on ? "rgba(139,124,255,.14)" : "transparent",
    color: on ? "var(--od-violet-3)" : "var(--od-muted-4)",
    fontWeight: on ? 500 : 400,
  };
}

export function NewWorkspace({ locale, t }: { locale: Locale; t: NewWorkspaceDictionary }) {
  const [state, setState] = useState<ScreenState>("default");
  const [name, setName] = useState("");
  const [seed, setSeed] = useState<"empty" | "copy">("empty");
  const [parts, setParts] = useState<string[]>(["assistants", "catalogue", "routing"]);
  const [access, setAccess] = useState<"me" | "team">("me");
  const [touched, setTouched] = useState(false);

  const taken = state === "taken";
  const creating = state === "creating";
  const prefilled = state === "typed" || creating || taken;
  const value = name || (prefilled ? t.name_placeholder : "");
  const blocked = value.trim().length < 2;
  const bad = taken || (touched && blocked);

  const accessNote =
    access === "me"
      ? t.access_me_note
      : interpolate(t.access_team_note, { count: CURRENT_MEMBERS });

  return (
    <div className="bg-od-canvas text-od-text-2 min-h-dvh text-[14px] leading-[1.45] ps-[224px]">
      <div className="fixed inset-y-0 start-0 z-50 h-dvh w-[224px]">
        <Sidebar locale={locale} active="settings" />
      </div>

      <StatePreview
        state={state}
        onChange={(next) => {
          setState(next);
          setTouched(false);
        }}
        states={["default", "typed", "creating", "taken"]}
        labels={{ default: "Default", typed: "Filled in", creating: "Creating", taken: "Name taken" }}
      />

      <div className="mx-auto max-w-[1400px] p-[26px_28px_90px]">
        <h1 className="text-od-text m-0 text-[24px] font-semibold tracking-[-0.02em]">
          {CURRENT_WORKSPACE}
        </h1>
        {/* A workspace is a separate installation, not a folder. */}
        <p className="text-od-muted-4 mt-2 max-w-[64ch] text-pretty">
          {t.behind_intro_before}
          <span className="text-od-text-3">{t.behind_intro_link}</span>
          {t.behind_intro_after}
        </p>
      </div>

      <div
        className="fixed inset-0 z-[60] flex items-start justify-center overflow-auto p-[52px_24px]"
        style={{ background: "var(--od-scrim-3)" }}
      >
        <div
          className="border-od-border-9 bg-od-panel w-full max-w-[560px] overflow-hidden rounded-xl border"
          style={{ boxShadow: "0 30px 80px var(--od-scrim-3)" }}
        >
          <div className="border-od-border flex items-start justify-between gap-4 border-b p-[20px_22px_14px]">
            <div className="min-w-0 max-w-[52ch]">
              <h2 className="text-od-text m-0 text-[19px] font-semibold">{t.title}</h2>
              <p className="text-od-muted-4 mt-[6px] text-[13px] text-pretty">{t.subtitle}</p>
            </div>
            <Link
              href={`/${locale}/home`}
              aria-label={t.close}
              className="border-od-border-2 text-od-muted hover:bg-od-raise hover:text-od-text inline-flex size-[30px] flex-none items-center justify-center rounded-[7px] border text-[14px] hover:no-underline"
            >
              ✕
            </Link>
          </div>

          <div className="p-[20px_22px_4px]">
            <label className="text-od-text-3 block text-[13px] font-medium">{t.name_label}</label>
            <div className="mt-2 flex items-center gap-[11px]">
              <span
                className="inline-flex size-[38px] flex-none items-center justify-center rounded-[9px] text-[15px] font-semibold"
                style={{
                  border: value.trim()
                    ? "1px solid var(--od-violet-border)"
                    : "1px dashed var(--od-stroke-3)",
                  background: value.trim() ? "rgba(139,124,255,.14)" : "var(--od-raise-5)",
                  color: value.trim() ? "var(--od-violet-3)" : "var(--od-faint)",
                }}
              >
                {value.trim() ? value.trim().slice(0, 1).toUpperCase() : "+"}
              </span>
              <input
                type="text"
                value={value}
                onChange={(event) => {
                  setName(event.target.value);
                  if (taken) setState("typed");
                }}
                placeholder={t.name_placeholder}
                className="bg-od-panel-deep-2 text-od-text min-w-0 flex-[1_1_auto] rounded-lg border p-[10px_13px] text-[14.5px] outline-none"
                style={{ borderColor: bad ? "var(--od-red-border)" : "var(--od-border-2)" }}
              />
            </div>
            <p
              className="mt-2 text-[12.5px]"
              style={{ color: bad ? "var(--od-red-text-2)" : "var(--od-faint)" }}
            >
              {taken ? t.name_help_taken : bad ? t.name_help_blank : t.name_help}
            </p>

            <div className="mt-5">
              <div className="text-od-text-3 text-[13px] font-medium">{t.seed_label}</div>
              <div className="mt-[9px] grid gap-2">
                {(
                  [
                    {
                      id: "empty" as const,
                      label: t.seed_empty,
                      note: t.seed_empty_note,
                    },
                    {
                      id: "copy" as const,
                      label: interpolate(t.seed_copy, { workspace: CURRENT_WORKSPACE }),
                      note: t.seed_copy_note,
                    },
                  ]
                ).map((entry) => {
                  const on = seed === entry.id;
                  return (
                    <button
                      key={entry.id}
                      type="button"
                      onClick={() => setSeed(entry.id)}
                      className="hover:bg-od-raise flex w-full cursor-pointer items-start gap-[11px] rounded-[9px] border p-[12px_14px] text-start"
                      style={{
                        borderColor: on ? "var(--od-violet-border)" : "var(--od-border-2)",
                        background: on ? "var(--od-canvas-violet)" : "transparent",
                      }}
                    >
                      <span
                        className="mt-1 size-[14px] flex-none rounded-full border"
                        style={{
                          borderColor: on ? "var(--od-violet)" : "var(--od-stroke-3)",
                          background: on ? "var(--od-violet)" : "transparent",
                          boxShadow: on ? "inset 0 0 0 3px var(--od-panel)" : "none",
                        }}
                      />
                      <span className="min-w-0 flex-[1_1_auto] text-start">
                        <span className="text-od-text block text-[13.5px] font-medium">
                          {entry.label}
                        </span>
                        <span className="text-od-faint mt-[2px] block text-[12.5px] text-pretty">
                          {entry.note}
                        </span>
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {seed === "copy" ? (
              <div className="border-od-border-2 bg-od-panel-deep-2 mt-3 rounded-[9px] border p-[13px_15px]">
                <div className="text-od-muted-4 text-[12.5px]">{t.copy_heading}</div>
                <div className="mt-[10px] flex flex-wrap gap-[7px]">
                  {PART_IDS.map((id, index) => {
                    const on = parts.includes(id);
                    return (
                      <button
                        key={id}
                        type="button"
                        onClick={() =>
                          setParts((current) =>
                            on ? current.filter((entry) => entry !== id) : [...current, id],
                          )
                        }
                        className="cursor-pointer rounded-full border p-[7px_13px] text-start text-[13px]"
                        style={pillStyle(on)}
                      >
                        {t[PART_KEYS[index]]}
                      </button>
                    );
                  })}
                </div>
                {/* A number can only ring in one workspace, so it is never copied. */}
                <div className="text-od-faint mt-[11px] text-[12.5px] text-pretty">{t.copy_note}</div>
              </div>
            ) : null}

            <div className="mt-5">
              <div className="text-od-text-3 text-[13px] font-medium">{t.access_label}</div>
              <div className="mt-[9px] flex flex-wrap gap-2">
                {(
                  [
                    { id: "me" as const, label: t.access_me },
                    {
                      id: "team" as const,
                      label: interpolate(t.access_team, { workspace: CURRENT_WORKSPACE }),
                    },
                  ]
                ).map((entry) => (
                  <button
                    key={entry.id}
                    type="button"
                    onClick={() => setAccess(entry.id)}
                    className="cursor-pointer rounded-full border p-[7px_13px] text-start text-[13px]"
                    style={pillStyle(access === entry.id)}
                  >
                    {entry.label}
                  </button>
                ))}
              </div>
              <p className="text-od-faint mt-[9px] text-[12.5px] text-pretty">{accessNote}</p>
            </div>

            {taken ? (
              <div className="border-od-red-border bg-od-red-bg mt-[18px] flex items-start gap-[11px] rounded-[9px] border p-[13px_15px]">
                <span className="mt-px flex-none text-[color:var(--od-red-text)]">!</span>
                <div className="min-w-0 text-[13px] text-pretty text-[color:var(--od-red-text-2)]">
                  {t.taken_before}
                  <span className="text-[color:var(--od-red-text)]">{t.name_placeholder}</span>
                  {t.taken_after}
                </div>
              </div>
            ) : null}

            <div className="border-od-border text-od-faint mt-[18px] border-t pt-[15px] text-[12.5px] text-pretty">
              {t.billing}
            </div>
          </div>

          <div className="border-od-border bg-od-panel-deep-2 mt-3 flex flex-wrap items-center justify-end gap-[10px] border-t p-[16px_22px]">
            {creating ? (
              <span className="text-od-muted-4 me-auto inline-flex items-center gap-[9px] text-[12.5px]">
                <span
                  className="size-[13px] rounded-full border-2 border-[color:var(--od-stroke-3)]"
                  style={{
                    borderTopColor: "var(--od-violet)",
                    animation: "od-spin .7s linear infinite",
                  }}
                />
                <span>{t.creating}</span>
              </span>
            ) : null}
            <Link
              href={`/${locale}/home`}
              className="border-od-border-2 text-od-muted hover:bg-od-raise hover:text-od-text-2 rounded-[7px] border p-[9px_15px] text-[13.5px] hover:no-underline"
            >
              {t.cancel}
            </Link>
            <button
              type="button"
              onClick={() => (blocked ? setTouched(true) : setState("creating"))}
              className="rounded-[7px] border p-[9px_16px] text-[13.5px] font-semibold"
              style={{
                borderColor:
                  blocked || creating ? "var(--od-border-2)" : "var(--od-violet-border)",
                background: blocked || creating ? "var(--od-raise-5)" : "var(--od-violet)",
                color: blocked || creating ? "var(--od-faint)" : "#12101d",
                cursor: creating ? "default" : blocked ? "not-allowed" : "pointer",
                opacity: creating ? 0.8 : 1,
              }}
            >
              {creating ? t.submit_busy : t.submit}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
