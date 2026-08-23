"use client";

import Link from "next/link";
import { useState } from "react";

import { StatePreview, type ScreenState } from "@/components/state-preview";
import type { Dictionary } from "@/lib/i18n";
import { interpolate } from "@/lib/i18n";
import type { Locale } from "@/lib/locales";

/** Placeholders until `api/` exists. The installation reports its own host and build. */
const INSTALLATION = { host: "telagent.wagner-partner.local", port: 8443, version: "v1.4.2" };
const UNLOCKS_AT = "11:19";

/**
 * Splits a translated sentence on a placeholder so the value can be rendered as its
 * own element. A hostname is machine data: monospace, and left to right even in Arabic.
 */
function withMachineValue(template: string, token: string, value: React.ReactNode) {
  const [before, after = ""] = template.split(`{${token}}`);
  return (
    <>
      {before}
      <span className="mono ltr-data">{value}</span>
      {after}
    </>
  );
}

export function SignIn({ locale, dictionary }: { locale: Locale; dictionary: Dictionary }) {
  const t = dictionary.auth;
  const [state, setState] = useState<ScreenState>("default");

  const offline = state === "offline";
  const blocked = state === "error";
  const showForm = state === "default" || blocked || offline;

  return (
    <div className="bg-od-canvas text-od-text-2 flex min-h-dvh flex-col">
      <StatePreview state={state} onChange={setState} />

      {offline ? (
        <div className="bg-od-red-bg border-od-red-border flex flex-wrap items-center gap-[14px] border-b px-7 py-4">
          <span
            className="size-[10px] flex-none rounded-full bg-[#F0605E]"
            style={{ animation: "od-ring 1.6s ease-out infinite" }}
          />
          <div className="min-w-[240px] flex-[1_1_340px]">
            <div className="text-od-red-text text-base font-semibold">{t.offline_title}</div>
            <div className="text-od-red-text-2 mt-[3px]">
              {withMachineValue(
                t.offline_body,
                "host",
                `${INSTALLATION.host}:${INSTALLATION.port}`,
              )}
            </div>
          </div>
          <button
            type="button"
            className="border-od-red-border-2 bg-od-red-bg-2 text-od-red-text-3 hover:bg-od-red-bg-3 cursor-pointer rounded-md border px-[15px] py-[9px] font-medium"
          >
            {t.offline_retry}
          </button>
        </div>
      ) : null}

      <div className="flex flex-1 items-center justify-center px-7 pt-[60px] pb-[90px]">
        {/* max-width, never a fixed width: German runs ~30% longer than English. */}
        <div className="w-full max-w-[420px]">
          <div className="flex flex-wrap items-baseline gap-[10px]">
            <div className="text-od-text text-[20px] font-semibold tracking-[-0.01em]">
              Tel-Agent
            </div>
            <span className="mono ltr-data text-od-faint-2 text-[12px]">{INSTALLATION.version}</span>
          </div>
          {/* The block follows the page direction; only the hostname itself is forced
              LTR, so in Arabic it still starts at the right edge like everything else. */}
          <div className="text-od-muted-5 mt-[6px] text-[12.5px] [overflow-wrap:anywhere]">
            <span className="mono ltr-data">{INSTALLATION.host}</span>
          </div>

          {blocked ? (
            <div className="border-od-red-border-3 bg-od-red-bg-4 mt-[22px] rounded-[10px] border p-4">
              <div className="flex flex-wrap items-center gap-[10px]">
                <span className="size-2 flex-none rounded-full bg-[#F0605E]" />
                <span className="text-od-red-text-5 text-[12px] font-bold tracking-[.06em] uppercase">
                  {t.blocked_label}
                </span>
              </div>
              <div className="text-od-red-text-3 mt-2 text-[15px] font-semibold text-pretty">
                {t.blocked_title}
              </div>
              <div className="text-od-red-text-6 mt-[5px] text-[13.5px] text-pretty">
                {t.blocked_body}
              </div>
              <div className="mono ltr-data text-od-red-text-7 mt-[10px] text-[12px]">
                {interpolate(t.blocked_unlocks, { time: UNLOCKS_AT })}
              </div>
            </div>
          ) : null}

          {state === "empty" ? (
            <div className="border-od-border-6 bg-od-panel-deep-2 mt-[26px] rounded-xl border border-dashed p-[26px]">
              <h1 className="m-0 text-[21px] font-semibold text-pretty">{t.empty_title}</h1>
              <p className="text-od-muted mt-[10px] text-pretty">{t.empty_body}</p>
              <button
                type="button"
                className="border-od-stroke bg-od-raise-10 text-od-text-2 hover:bg-od-border-3 mt-[18px] w-full cursor-pointer rounded-lg border p-3 text-[15px] font-semibold"
              >
                {t.empty_action}
              </button>
            </div>
          ) : null}

          {showForm ? <SignInCard dictionary={dictionary} blocked={blocked} offline={offline} /> : null}

          {state === "loading" ? <LoadingCard /> : null}

          <div className="text-od-faint-2 mt-5 flex flex-wrap items-center justify-between gap-x-4 gap-y-2 text-[12.5px]">
            <span className="text-od-muted-5">{t.self_hosted}</span>
            <Link href={`/${locale}/login`} className="text-od-muted-5 hover:underline">
              {t.continue}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

function SignInCard({
  dictionary,
  blocked,
  offline,
}: {
  dictionary: Dictionary;
  blocked: boolean;
  offline: boolean;
}) {
  const t = dictionary.auth;
  const disabled = blocked || offline;
  const inputClass = [
    "mt-2 w-full rounded-lg border px-[13px] py-[11px] text-[15px] outline-none ltr-data",
    "bg-od-canvas-2 text-od-text-2 focus:border-od-violet",
    blocked ? "border-od-red-border-2" : "border-od-border-6",
  ].join(" ");

  return (
    <div className="border-od-line bg-od-panel-deep-3 mt-[26px] rounded-xl border p-[26px]">
      <h1 className="m-0 text-[21px] font-semibold tracking-[-0.01em] text-pretty">{t.title}</h1>
      <p className="text-od-muted-4 mt-2 text-pretty">{t.subtitle}</p>

      <div className="mt-5 flex flex-col gap-[14px]">
        <div>
          <label htmlFor="username" className="text-od-text-3 block font-medium">
            {t.username}
          </label>
          {/* A username is Latin-script data and stays LTR even in Arabic. */}
          <input id="username" autoComplete="username" dir="ltr" className={inputClass} />
        </div>

        <div>
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <label htmlFor="password" className="text-od-text-3 font-medium">
              {t.password}
            </label>
            <a href="#" className="text-od-muted-5 text-[12.5px] hover:underline">
              {t.forgot}
            </a>
          </div>
          <input
            id="password"
            type="password"
            autoComplete="current-password"
            dir="ltr"
            className={inputClass}
          />
          {blocked ? (
            <div className="text-od-red-text-4 mt-2 text-[13px] text-pretty">{t.wrong_password}</div>
          ) : null}
        </div>

        <button
          type="button"
          disabled={disabled}
          className={[
            "mt-1 w-full rounded-lg border p-3 text-[15px] font-semibold whitespace-normal",
            disabled
              ? "border-od-border-6 bg-od-raise text-od-faint-2 cursor-not-allowed"
              : "border-od-stroke bg-od-raise-10 text-od-text-2 hover:bg-od-border-3 cursor-pointer",
          ].join(" ")}
        >
          {offline ? t.submit_offline : blocked ? t.submit_locked : t.submit}
        </button>
      </div>

      <div className="border-od-border mt-[18px] flex flex-wrap items-center justify-between gap-x-4 gap-y-[10px] border-t pt-4">
        <span className="text-od-muted-5 text-[13px]">{t.key_prompt}</span>
        <a href="#" className="text-od-violet hover:text-od-violet-2 text-[13px] hover:underline">
          {t.key_link}
        </a>
      </div>
    </div>
  );
}

function LoadingCard() {
  const shimmer = (from: string, to: string) => ({
    background: `linear-gradient(90deg,var(${from}),var(${to}),var(${from}))`,
    backgroundSize: "420px 100%",
    animation: "od-shimmer 1.4s linear infinite",
  });

  return (
    <div className="border-od-line bg-od-panel-deep-3 mt-[26px] rounded-xl border p-[26px]">
      <div className="h-6 w-2/5 rounded-md" style={shimmer("--od-raise-4", "--od-raise-13")} />
      <div
        className="mt-3 h-[14px] w-[85%] rounded-[5px]"
        style={shimmer("--od-raise-2", "--od-raise-11")}
      />
      <div className="mt-[22px] flex flex-col gap-[14px]">
        {[0, 1, 2].map((index) => (
          <div
            key={index}
            className="border-od-raise-12 h-[46px] w-full rounded-lg border"
            style={shimmer("--od-panel", "--od-raise-7")}
          />
        ))}
      </div>
    </div>
  );
}
