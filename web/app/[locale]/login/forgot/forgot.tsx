"use client";

import Link from "next/link";
import { useState } from "react";

import { StatePreview, type ScreenState } from "@/components/state-preview";
import { interpolate } from "@/lib/i18n";
import type { Locale } from "@/lib/locales";

import {
  AuthCard,
  AuthFrame,
  OfflineBanner,
  AuthAction,
  authInputClass,
  withMachineValue,
} from "../auth-frame";
import { INSTALLATION } from "../installation";

import type { ForgotDictionary } from "./page";

/** Placeholder until `api/` exists - the server decides when a caller may ask again. */
const RETRY_AT = "11:24";
/** The command an administrator runs on the machine itself. Not copy: it is typed verbatim. */
const RESET_COMMAND = "tel-agent admin reset-password";

/**
 * Step one of three: ask for the account, get a code.
 *
 * The screen never says whether the username exists. "If the account exists" is the
 * whole point - an error here would tell anyone who asks which usernames are real.
 *
 * The `none` state is the honest case for a self-hosted product: an installation with
 * no mail server cannot send anything, so the screen hands over the command instead of
 * promising an email that will never arrive.
 */
export function Forgot({ locale, t }: { locale: Locale; t: ForgotDictionary }) {
  const [state, setState] = useState<ScreenState>("default");

  const offline = state === "offline";
  const limited = state === "error";
  const noEmail = state === "none";
  const disabled = offline || limited;

  return (
    <AuthFrame
      banner={
        offline ? (
          <OfflineBanner
            title={t.offline_title}
            body={withMachineValue(
              t.offline_body,
              "host",
              `${INSTALLATION.host}:${INSTALLATION.port}`,
            )}
            retry={t.offline_retry}
          />
        ) : undefined
      }
      footer={
        <>
          <span className="text-od-muted-5">{t.self_hosted}</span>
          <Link href={`/${locale}/login`} className="text-od-muted-5 hover:underline">
            {t.back}
          </Link>
        </>
      }
    >
      <StatePreview
        state={state}
        onChange={setState}
        states={["default", "none", "loading", "error", "offline"]}
        labels={{ none: "No mail server" }}
      />

      {limited ? (
        <div className="border-od-red-border-3 bg-od-red-bg-4 mt-[22px] rounded-[10px] border p-4">
          <div className="flex flex-wrap items-center gap-[10px]">
            <span className="size-2 flex-none rounded-full bg-[#F0605E]" />
            <span className="text-od-red-text-5 text-[12px] font-bold tracking-[.06em] uppercase">
              {t.limit_label}
            </span>
          </div>
          <div className="text-od-red-text-3 mt-2 text-[15px] font-semibold text-pretty">
            {t.limit_title}
          </div>
          <div className="text-od-red-text-6 mt-[5px] text-[13.5px] text-pretty">{t.limit_body}</div>
          <div className="mono ltr-data text-od-red-text-7 mt-[10px] text-[12px]">
            {interpolate(t.limit_retry_at, { time: RETRY_AT })}
          </div>
        </div>
      ) : null}

      {state === "loading" ? <LoadingCard /> : null}

      {noEmail ? (
        <AuthCard>
          <h1 className="m-0 text-[21px] font-semibold tracking-[-0.01em] text-pretty">
            {t.no_mail_title}
          </h1>
          <p className="text-od-muted-4 mt-2 text-pretty">{t.no_mail_body}</p>

          {/* Machine input: verbatim, monospace, left to right in every language. */}
          <div
            dir="ltr"
            className="border-od-border-6 bg-od-canvas-2 mono ltr-data text-od-text-3 mt-4 rounded-lg border p-[13px] text-[12.5px] [overflow-wrap:anywhere]"
          >
            {RESET_COMMAND} &lt;username&gt;
          </div>

          <p className="text-od-muted-5 mt-3 text-[13px] text-pretty">{t.no_mail_hint}</p>

          <Link
            href={`/${locale}/settings`}
            className="text-od-violet hover:text-od-violet-2 mt-4 inline-block text-[13px] hover:underline"
          >
            {t.no_mail_settings}
          </Link>
        </AuthCard>
      ) : null}

      {state !== "loading" && !noEmail ? (
        <AuthCard>
          <h1 className="m-0 text-[21px] font-semibold tracking-[-0.01em] text-pretty">{t.title}</h1>
          <p className="text-od-muted-4 mt-2 text-pretty">{t.body}</p>

          <div className="mt-5">
            <label htmlFor="username" className="text-od-text-3 block font-medium">
              {t.username}
            </label>
            {/* A username is Latin-script data and stays LTR even in Arabic. */}
            <input
              id="username"
              autoComplete="username"
              dir="ltr"
              disabled={disabled}
              className={authInputClass(limited)}
            />
          </div>

          <AuthAction href={`/${locale}/login/code`} disabled={disabled} className="mt-4">
            {offline ? t.send_offline : t.send}
          </AuthAction>

          <p className="text-od-muted-5 mt-4 text-[13px] text-pretty">{t.privacy_note}</p>
        </AuthCard>
      ) : null}
    </AuthFrame>
  );
}

/** The same shimmer the sign-in card uses, so the flow does not change texture mid-way. */
function LoadingCard() {
  const shimmer = (from: string, to: string) => ({
    background: `linear-gradient(90deg,var(${from}),var(${to}),var(${from}))`,
    backgroundSize: "420px 100%",
    animation: "od-shimmer 1.4s linear infinite",
  });

  return (
    <AuthCard>
      <div
        className="h-[22px] w-[62%] rounded-md"
        style={shimmer("--od-raise-2", "--od-raise-5")}
      />
      <div
        className="mt-3 h-[15px] w-full rounded-md"
        style={shimmer("--od-raise-2", "--od-raise-5")}
      />
      <div
        className="mt-[26px] h-[44px] w-full rounded-lg"
        style={shimmer("--od-raise-2", "--od-raise-5")}
      />
      <div
        className="mt-4 h-[44px] w-full rounded-lg"
        style={shimmer("--od-raise-2", "--od-raise-5")}
      />
    </AuthCard>
  );
}
