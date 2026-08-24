"use client";

import Link from "next/link";
import { useRef, useState } from "react";

import { StatePreview, type ScreenState } from "@/components/state-preview";
import { interpolate } from "@/lib/i18n";
import type { Locale } from "@/lib/locales";

import {
  AuthCard,
  AuthFrame,
  OfflineBanner,
  AuthAction,
  withMachineValue,
} from "../auth-frame";
import { INSTALLATION } from "../installation";

import type { CodeDictionary } from "./page";

const DIGITS = 6;
/** Placeholders until `api/` exists. The address is masked by the server, not here. */
const SENT_TO = "l.w•••@wagner-partner.at";
const EXPIRES_IN = "9:41";
const ATTEMPTS_LEFT = 2;

/**
 * Step two of three: the code itself.
 *
 * The same screen serves two-factor sign-in. The only difference is where the caller
 * came from and where they go next, so it is one screen with two entries rather than
 * two screens that drift apart.
 *
 * The six boxes are `dir="ltr"` in every language. A code has an order that exists
 * outside the interface - it is read aloud and typed left to right the same way a dial
 * pad reads 1-2-3 - so it must not mirror under RTL.
 */
export function Code({ locale, t }: { locale: Locale; t: CodeDictionary }) {
  const [state, setState] = useState<ScreenState>("default");
  const [digits, setDigits] = useState<string[]>(() => Array(DIGITS).fill(""));
  const boxes = useRef<(HTMLInputElement | null)[]>([]);

  const offline = state === "offline";
  const wrong = state === "error";
  const expired = state === "stale";
  const disabled = offline || expired;
  const complete = digits.every((digit) => digit !== "");

  function write(index: number, value: string) {
    const typed = value.replace(/\D/g, "");
    if (!typed) return;

    setDigits((previous) => {
      const next = [...previous];
      // A paste fills the rest of the row from here; a keystroke fills one box.
      for (let offset = 0; offset < typed.length && index + offset < DIGITS; offset += 1) {
        next[index + offset] = typed[offset];
      }
      return next;
    });

    const landed = Math.min(index + typed.length, DIGITS - 1);
    boxes.current[landed]?.focus();
  }

  function onKeyDown(index: number, event: React.KeyboardEvent<HTMLInputElement>) {
    if (event.key === "Backspace") {
      event.preventDefault();
      setDigits((previous) => {
        const next = [...previous];
        // Backspace clears this box, or steps back into the previous one if empty.
        if (next[index]) next[index] = "";
        else if (index > 0) next[index - 1] = "";
        return next;
      });
      if (!digits[index] && index > 0) boxes.current[index - 1]?.focus();
      return;
    }

    // The row is pinned LTR, so the arrow keys mean the same thing in Arabic.
    if (event.key === "ArrowLeft" && index > 0) boxes.current[index - 1]?.focus();
    if (event.key === "ArrowRight" && index < DIGITS - 1) boxes.current[index + 1]?.focus();
  }

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
        states={["default", "loading", "error", "stale", "offline"]}
        labels={{ stale: "Expired" }}
      />

      {state === "loading" ? (
        <LoadingCard />
      ) : (
        <AuthCard>
          <h1 className="m-0 text-[21px] font-semibold tracking-[-0.01em] text-pretty">{t.title}</h1>
          {/* The address is machine data inside a sentence: masked, LTR, monospace. */}
          <p className="text-od-muted-4 mt-2 text-pretty">
            {withMachineValue(t.sent_to, "address", SENT_TO)}
          </p>

          <div dir="ltr" className="mt-5 flex justify-between gap-[8px]">
            {digits.map((digit, index) => (
              <input
                key={index}
                ref={(element) => {
                  boxes.current[index] = element;
                }}
                value={digit}
                onChange={(event) => write(index, event.target.value)}
                onKeyDown={(event) => onKeyDown(index, event)}
                inputMode="numeric"
                autoComplete={index === 0 ? "one-time-code" : "off"}
                maxLength={DIGITS}
                disabled={disabled}
                aria-label={interpolate(t.digit_label, { position: index + 1, total: DIGITS })}
                className={[
                  "mono h-[54px] w-full min-w-0 rounded-lg border text-center text-[22px] outline-none",
                  "bg-od-canvas-2 text-od-text focus:border-od-violet",
                  wrong ? "border-od-red-border-2" : "border-od-border-6",
                  disabled ? "text-od-faint-2 cursor-not-allowed" : "",
                ].join(" ")}
              />
            ))}
          </div>

          {wrong ? (
            <div className="text-od-red-text-4 mt-3 text-[13px] text-pretty">
              {interpolate(t.wrong_code, { attempts: ATTEMPTS_LEFT })}
            </div>
          ) : null}

          {expired ? (
            <div className="border-od-amber-border bg-od-amber-bg mt-3 rounded-[10px] border p-[13px]">
              <div className="text-od-amber-text text-[13.5px] font-semibold text-pretty">
                {t.expired_title}
              </div>
              <div className="text-od-amber-text-2 mt-1 text-[13px] text-pretty">
                {t.expired_body}
              </div>
            </div>
          ) : null}

          <AuthAction
            href={`/${locale}/login/new-password`}
            disabled={disabled || !complete}
            className="mt-4"
          >
            {offline ? t.submit_offline : t.submit}
          </AuthAction>

          <div className="border-od-border mt-[18px] flex flex-wrap items-center justify-between gap-x-4 gap-y-[10px] border-t pt-4">
            {expired ? (
              <span className="text-od-muted-5 text-[13px]">{t.resend_prompt_expired}</span>
            ) : (
              /* A countdown is a duration, not prose: LTR and monospace in every language. */
              <span className="text-od-muted-5 text-[13px]">
                {withMachineValue(t.expires_in, "time", EXPIRES_IN)}
              </span>
            )}
            <Link
              href={`/${locale}/login/forgot`}
              className="text-od-violet hover:text-od-violet-2 text-[13px] hover:underline"
            >
              {t.resend}
            </Link>
          </div>
        </AuthCard>
      )}
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
      <div className="h-[22px] w-[58%] rounded-md" style={shimmer("--od-raise-2", "--od-raise-5")} />
      <div
        className="mt-3 h-[15px] w-[80%] rounded-md"
        style={shimmer("--od-raise-2", "--od-raise-5")}
      />
      <div dir="ltr" className="mt-5 flex justify-between gap-[8px]">
        {Array.from({ length: DIGITS }).map((_, index) => (
          <div
            key={index}
            className="h-[54px] w-full rounded-lg"
            style={shimmer("--od-raise-2", "--od-raise-5")}
          />
        ))}
      </div>
      <div
        className="mt-4 h-[44px] w-full rounded-lg"
        style={shimmer("--od-raise-2", "--od-raise-5")}
      />
    </AuthCard>
  );
}
