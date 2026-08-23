"use client";

import Link from "next/link";
import { useState } from "react";

import { Sidebar } from "@/components/shell/sidebar";
import { StatePreview, type ScreenState } from "@/components/state-preview";
import { interpolate } from "@/lib/i18n";
import type { Locale } from "@/lib/locales";

import type { CatalogueDictionary } from "./page";

type Key = keyof CatalogueDictionary;

const SERVICE_COLUMNS =
  "minmax(0,1.8fr) minmax(0,.8fr) minmax(0,.9fr) minmax(0,1.1fr) 104px";

/**
 * A price in euro is a figure; "hourly rate" and "on request" are phrases. A length
 * in minutes is a number with a translated unit. Staff are named people, except
 * "any free", which is a choice the interface offers.
 */
const SERVICES: {
  id: string;
  name: Key;
  minutes?: number;
  price?: string;
  priceKey?: Key;
  who?: string;
  whoKey?: Key;
  says: Key;
  on: boolean;
}[] = [
  {
    id: "consultation",
    name: "svc_consultation",
    minutes: 60,
    price: "€ 120",
    who: "Georg Wagner",
    says: "svc_consultation_says",
    on: true,
  },
  {
    id: "followup",
    name: "svc_followup",
    minutes: 45,
    price: "€ 90",
    who: "Georg Wagner, Sabine",
    says: "svc_followup_says",
    on: true,
  },
  {
    id: "first",
    name: "svc_first",
    minutes: 30,
    price: "€ 60",
    whoKey: "who_any",
    says: "svc_first_says",
    on: true,
  },
  {
    id: "onsite",
    name: "svc_onsite",
    minutes: 90,
    priceKey: "price_hourly",
    who: "Georg Wagner",
    says: "svc_onsite_says",
    on: true,
  },
  {
    id: "phone",
    name: "svc_phone",
    minutes: 20,
    price: "€ 40",
    whoKey: "who_any",
    says: "svc_phone_says",
    on: true,
  },
  {
    id: "emergency",
    name: "svc_emergency",
    priceKey: "price_on_request",
    who: "Georg Wagner",
    says: "svc_emergency_says",
    on: false,
  },
];

/**
 * Two fields are fixed because a phone system cannot recognise a caller without them.
 * Every other column is the customer's own, and each says separately whether the
 * assistant may read it out loud.
 */
const FIELDS: { id: string; label: Key; type: Key; note: Key; fixed: boolean; on: boolean }[] = [
  { id: "name", label: "field_name", type: "type_text", note: "field_name_note", fixed: true, on: true },
  { id: "number", label: "field_number", type: "type_phone", note: "field_number_note", fixed: true, on: true },
  { id: "appointments", label: "field_appointments", type: "type_linked", note: "field_appointments_note", fixed: false, on: true },
  { id: "consent", label: "field_consent", type: "type_date", note: "field_consent_note", fixed: false, on: false },
  { id: "customer_no", label: "field_customer_no", type: "type_text", note: "field_customer_no_note", fixed: false, on: true },
  { id: "balance", label: "field_balance", type: "type_money", note: "field_balance_note", fixed: false, on: false },
  { id: "internal", label: "field_internal", type: "type_long_text", note: "field_internal_note", fixed: false, on: false },
];

const SAY_LINES: { q: Key; a: Key; from: Key }[] = [
  { q: "say_price_q", a: "say_price_a", from: "say_price_from" },
  { q: "say_onsite_q", a: "say_onsite_a", from: "say_onsite_from" },
  { q: "say_urgent_q", a: "say_urgent_a", from: "say_urgent_from" },
  { q: "say_balance_q", a: "say_balance_a", from: "say_balance_from" },
];

const GAPS: Key[] = ["gap_cancellation", "gap_emergency_price", "gap_consent"];

const TABS: { id: string; label: Key }[] = [
  { id: "services", label: "tab_services" },
  { id: "fields", label: "tab_fields" },
  { id: "preview", label: "tab_preview" },
];

const LENGTH_CHOICES = [20, 30, 45, 60, 90];

/** Two are people; "any free" is a choice the interface offers. */
const STAFF: { id: string; name?: string; labelKey?: Key }[] = [
  { id: "georg", name: "Georg Wagner" },
  { id: "sabine", name: "Sabine" },
  { id: "any", labelKey: "who_any" },
];

function Switch({ on, onClick }: { on: boolean; onClick?: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={on}
      className="inline-flex h-[21px] w-[38px] flex-none cursor-pointer items-center rounded-full border-none p-[2px]"
      style={{
        background: on ? "rgba(139,124,255,.18)" : "var(--od-raise)",
        justifyContent: on ? "flex-end" : "flex-start",
        boxShadow: `inset 0 0 0 1px ${on ? "var(--od-violet-border)" : "var(--od-border-7)"}`,
      }}
    >
      <span
        className="block size-[15px] rounded-full"
        style={{ background: on ? "var(--od-violet)" : "var(--od-stroke-5)" }}
      />
    </button>
  );
}

function Chip({ label, on, onClick }: { label: string; on: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`cursor-pointer rounded-[7px] border p-[7px_11px] text-[13px] whitespace-nowrap ${
        on
          ? "border-od-stroke bg-od-line-2 text-od-text"
          : "border-od-border-7 bg-od-panel-deep-3 text-od-muted-4"
      }`}
    >
      {label}
    </button>
  );
}

export function Catalogue({ locale, t }: { locale: Locale; t: CatalogueDictionary }) {
  const [state, setState] = useState<ScreenState>("default");
  const [tab, setTab] = useState("services");
  const [newOpen, setNewOpen] = useState(false);
  const [servicesOff, setServicesOff] = useState<string[]>(
    SERVICES.filter((entry) => !entry.on).map((entry) => entry.id),
  );
  const [fieldsOff, setFieldsOff] = useState<string[]>(
    FIELDS.filter((entry) => !entry.on).map((entry) => entry.id),
  );

  const empty = state === "empty";
  const loading = state === "loading";
  const showBody = state === "default" || empty;

  return (
    <div className="bg-od-canvas text-od-text-2 min-h-dvh text-[14px] leading-[1.45] ps-[224px]">
      <div className="fixed inset-y-0 start-0 z-50 h-dvh w-[224px]">
        <Sidebar locale={locale} active="settings" />
      </div>

      <StatePreview state={state} onChange={setState} states={["default", "empty", "loading"]} />

      <div className="mx-auto max-w-[1400px] p-[26px_28px_90px]">
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
            <div className="border-od-line bg-od-panel-deep-3 mt-[22px] overflow-hidden rounded-[10px] border">
              {[64, 78, 56, 82, 70, 60].map((width, index) => (
                <div
                  key={index}
                  className="flex items-center gap-4 border-b border-[color:var(--od-raise-6)] p-[16px_18px]"
                >
                  <div
                    className="h-[14px] flex-[1_1_auto] rounded"
                    style={{
                      maxWidth: `${width}%`,
                      background:
                        "linear-gradient(90deg,var(--od-raise-2),var(--od-raise-11),var(--od-raise-2))",
                      backgroundSize: "420px 100%",
                      animation: "od-shimmer 1.4s linear infinite",
                    }}
                  />
                  <div className="h-3 w-[70px] flex-none rounded bg-[var(--od-raise-4)]" />
                  <div className="h-3 w-[70px] flex-none rounded bg-[var(--od-raise-4)]" />
                  <div className="h-5 w-10 flex-none rounded-full bg-[var(--od-raise-8)]" />
                </div>
              ))}
            </div>
          </div>
        ) : null}

        {showBody ? (
          <div>
            <div className="flex flex-wrap items-end justify-between gap-x-5 gap-y-[14px]">
              <div className="max-w-[66ch]">
                <h1 className="text-od-text m-0 text-[26px] font-semibold tracking-[-0.02em]">
                  {t.title}
                </h1>
                <p className="text-od-muted-4 mt-[6px] text-pretty">
                  {t.intro}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setNewOpen(true)}
                className="border-od-stroke bg-od-raise-10 text-od-text-2 hover:bg-od-border-3 cursor-pointer rounded-[7px] border p-[9px_15px] font-medium"
              >
                {t.new_service}
              </button>
            </div>

            <div className="border-od-border-2 bg-od-panel mt-5 flex w-max max-w-full flex-wrap gap-[6px] rounded-[10px] border p-[5px]">
              {TABS.map(({ id, label }) => {
                const on = tab === id;
                return (
                  <button
                    key={id}
                    type="button"
                    onClick={() => setTab(id)}
                    className="cursor-pointer rounded-[7px] border p-[8px_14px] text-[13.5px] whitespace-nowrap"
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

            {tab === "services" ? (
              empty ? (
                <div className="border-od-border-6 bg-od-panel-deep-2 mt-[18px] rounded-[10px] border border-dashed p-[46px_30px] text-center">
                  <h3 className="text-od-text m-0 text-[19px] font-semibold">
                    {t.empty_services_title}
                  </h3>
                  <p className="text-od-muted mx-auto mt-[10px] max-w-[56ch] text-pretty">
                    {t.empty_services_body}
                  </p>
                  <div className="mt-5 flex flex-wrap justify-center gap-[10px]">
                    <button
                      type="button"
                      onClick={() => setNewOpen(true)}
                      className="border-od-stroke bg-od-raise-10 text-od-text-2 hover:bg-od-border-3 cursor-pointer rounded-md border p-[9px_16px] font-medium"
                    >
                      {t.empty_services_add}
                    </button>
                    <button
                      type="button"
                      className="border-od-border-2 text-od-muted hover:text-od-text-2 cursor-pointer rounded-md border bg-transparent p-[9px_16px]"
                    >
                      {t.empty_services_template}
                    </button>
                  </div>
                </div>
              ) : (
                <div>
                  <div className="border-od-line bg-od-panel-deep-3 mt-[18px] overflow-x-auto overflow-y-hidden rounded-[10px] border">
                    <div
                      className="border-od-line bg-od-canvas-2 text-od-faint grid gap-[18px] border-b p-[11px_18px] text-[11px] tracking-[.08em] uppercase"
                      style={{ gridTemplateColumns: SERVICE_COLUMNS }}
                    >
                      <span>{t.column_service}</span>
                      <span>{t.column_length}</span>
                      <span>{t.column_price}</span>
                      <span>{t.column_who}</span>
                      <span>{t.column_bookable}</span>
                    </div>

                    {SERVICES.map((service) => {
                      const on = !servicesOff.includes(service.id);
                      return (
                        <div
                          key={service.id}
                          className="hover:bg-od-raise grid cursor-pointer items-start gap-[18px] border-b border-[color:var(--od-raise-6)] p-[14px_18px]"
                          style={{ gridTemplateColumns: SERVICE_COLUMNS, opacity: on ? 1 : 0.6 }}
                        >
                          <div className="min-w-0">
                            <div className="text-od-text font-medium text-pretty">
                              {t[service.name]}
                            </div>
                            <div className="text-od-muted-5 mt-[3px] text-[12.5px] text-pretty">
                              {t[service.says]}
                            </div>
                          </div>
                          <div className="text-od-text-5 text-[13px]">
                            {service.minutes ? interpolate(t.minutes, { count: service.minutes }) : "—"}
                          </div>
                          {service.priceKey ? (
                            <div className="text-od-text-5 text-[13px]">{t[service.priceKey]}</div>
                          ) : (
                            <div dir="ltr" className="mono ltr-data text-od-text-5 text-start text-[13px]">
                              {service.price}
                            </div>
                          )}
                          <div className="text-od-text-5 min-w-0 text-pretty">
                            {service.whoKey ? t[service.whoKey] : service.who}
                          </div>
                          <div>
                            <Switch
                              on={on}
                              onClick={() =>
                                setServicesOff((current) =>
                                  on
                                    ? [...current, service.id]
                                    : current.filter((entry) => entry !== service.id),
                                )
                              }
                            />
                          </div>
                        </div>
                      );
                    })}

                    <button
                      type="button"
                      onClick={() => setNewOpen(true)}
                      className="bg-od-canvas-2 text-od-muted-5 hover:bg-od-raise hover:text-od-text-2 w-full cursor-pointer border-none p-[13px_18px] text-start text-[13px]"
                    >
                      {t.add_service}
                    </button>
                  </div>

                  <div className="border-od-border-4 bg-od-panel-deep-4 mt-[14px] flex items-start gap-3 rounded-[9px] border p-[13px_16px]">
                    <span className="text-od-faint mt-px flex-none">⌾</span>
                    <div className="text-od-muted-3 min-w-0 text-pretty">
                      {t.services_note}
                    </div>
                  </div>
                </div>
              )
            ) : null}

            {tab === "fields" ? (
              empty ? (
                <div className="border-od-border-6 bg-od-panel-deep-2 mt-[18px] rounded-[10px] border border-dashed p-[44px_30px] text-center">
                  <h3 className="text-od-text m-0 text-[19px] font-semibold">Only a name and a number</h3>
                  <p className="text-od-muted mx-auto mt-[10px] max-w-[56ch] text-pretty">
                    {t.empty_fields_body}
                  </p>
                  <button
                    type="button"
                    className="border-od-stroke bg-od-raise-10 text-od-text-2 hover:bg-od-border-3 mt-[18px] cursor-pointer rounded-md border p-[9px_16px] font-medium"
                  >
                    {t.empty_fields_add}
                  </button>
                </div>
              ) : (
                <div>
                  <div className="border-od-line bg-od-panel-deep-3 mt-[18px] overflow-hidden rounded-[10px] border">
                    <div className="border-od-line bg-od-canvas-2 flex flex-wrap items-start justify-between gap-x-[18px] gap-y-[10px] border-b p-[15px_18px]">
                      <div className="max-w-[72ch] min-w-0">
                        <div className="text-od-text text-[15px] font-semibold">Contact fields</div>
                        <div className="text-od-muted-5 mt-1 text-[12.5px] text-pretty">
                          {t.fields_note}
                        </div>
                      </div>
                    </div>

                    {FIELDS.map((field) => {
                      const on = !fieldsOff.includes(field.id);
                      return (
                        <div
                          key={field.id}
                          className="hover:bg-od-raise flex flex-wrap items-center gap-x-4 gap-y-[10px] border-b border-[color:var(--od-raise-6)] p-[14px_18px]"
                        >
                          <div className="min-w-0 flex-[1_1_220px]">
                            <div className="flex flex-wrap items-center gap-2">
                              <span className="text-od-text font-medium">{t[field.label]}</span>
                              {field.fixed ? (
                                <span className="border-od-border-3 text-od-faint rounded border p-[1px_7px] text-[11px] font-semibold">
                                  {t.fixed}
                                </span>
                              ) : null}
                            </div>
                            <div className="text-od-muted-5 mt-[3px] text-[12.5px] text-pretty">
                              {t[field.note]}
                            </div>
                          </div>

                          <span
                            dir="ltr"
                            className="mono ltr-data border-od-border-7 text-od-muted-2 flex-none rounded-[5px] border bg-[var(--od-raise-5)] p-[3px_9px] text-[11.5px]"
                          >
                            {t[field.type]}
                          </span>

                          <div className="flex min-w-[168px] flex-none items-center gap-[9px]">
                            <span className="text-od-muted-4 text-[12.5px]">
                              {field.fixed
                                ? t.always_read
                                : on
                                  ? t.may_read
                                  : t.hidden}
                            </span>
                            {field.fixed ? (
                              <span
                                title={t.cannot_switch_off}
                                className="border-od-border-7 text-od-faint-2 inline-flex h-[21px] w-[38px] flex-none items-center justify-center rounded-full border border-dashed bg-transparent text-[11px]"
                              >
                                locked
                              </span>
                            ) : (
                              <Switch
                                on={on}
                                onClick={() =>
                                  setFieldsOff((current) =>
                                    on
                                      ? [...current, field.id]
                                      : current.filter((entry) => entry !== field.id),
                                  )
                                }
                              />
                            )}
                          </div>
                        </div>
                      );
                    })}

                    <button
                      type="button"
                      className="bg-od-canvas-2 text-od-muted-5 hover:bg-od-raise hover:text-od-text-2 w-full cursor-pointer border-none p-[13px_18px] text-start text-[13px]"
                    >
                      {t.add_field}
                    </button>
                  </div>

                  {/* The agent cannot verify who is holding the phone. That is the whole risk. */}
                  <div className="border-od-red-border-4 bg-od-red-bg-6 mt-[14px] flex items-start gap-3 rounded-[9px] border p-[13px_16px]">
                    <span className="mt-px flex-none text-[color:var(--od-red-text-4)]">!</span>
                    <div className="min-w-0 text-pretty text-[color:var(--od-red-text-7)]">
                      {t.fields_warning}
                    </div>
                  </div>
                </div>
              )
            ) : null}

            {tab === "preview" ? (
              empty ? (
                <div className="border-od-border-6 bg-od-panel-deep-2 mt-[18px] rounded-[10px] border border-dashed p-[44px_30px] text-center">
                  <h3 className="text-od-text m-0 text-[19px] font-semibold">Nothing to say yet</h3>
                  <p className="text-od-muted mx-auto mt-[10px] max-w-[58ch] text-pretty">
                    {t.empty_preview_body}
                  </p>
                </div>
              ) : (
                <div className="mt-[18px] flex flex-wrap items-start gap-4">
                  <div className="border-od-line bg-od-panel-deep-3 min-w-[min(100%,380px)] flex-[2_1_420px] rounded-[10px] border p-[18px]">
                    <div className="text-od-muted-4 text-[12px] font-semibold tracking-[.07em] uppercase">
                      {t.preview_heading}
                    </div>
                    <div className="mt-[14px] flex flex-col gap-[10px]">
                      {SAY_LINES.map((line) => (
                        <div
                          key={line.q}
                          className="border-od-line bg-od-canvas-2 rounded-[9px] border p-[12px_14px]"
                        >
                          <div className="text-od-faint text-[12.5px]">{t[line.q]}</div>
                          <div className="mt-[5px] text-[14.5px] leading-[1.6] text-pretty text-[color:var(--od-text-4)]">
                            {t[line.a]}
                          </div>
                          <div className="text-od-faint-2 mt-[6px] text-[12px]">{t[line.from]}</div>
                        </div>
                      ))}
                    </div>
                    <div className="text-od-faint mt-3 text-[12.5px] text-pretty">
                      {t.preview_note}
                    </div>
                  </div>

                  <div className="flex max-w-[380px] min-w-[min(100%,280px)] flex-[1_1_280px] flex-col gap-[14px]">
                    <div className="border-od-line bg-od-panel-deep-3 rounded-[10px] border p-4">
                      <div className="text-od-muted-4 text-[12px] font-semibold tracking-[.07em] uppercase">
                        {t.gaps_heading}
                      </div>
                      <div className="mt-2 flex flex-col">
                        {GAPS.map((gap) => (
                          <div
                            key={gap}
                            className="border-od-border flex items-baseline gap-[10px] border-b py-[9px]"
                          >
                            <span className="flex-none text-[12px] text-[color:var(--od-amber-text)]">
                              !
                            </span>
                            <span className="text-od-text-4 min-w-0 flex-[1_1_auto] text-[13px] text-pretty">
                              {t[gap]}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="border-od-line bg-od-panel-deep-3 rounded-[10px] border p-4">
                      <div className="text-od-muted-4 text-[12px] font-semibold tracking-[.07em] uppercase">
                        {t.used_by}
                      </div>
                      <div className="mt-[10px] flex flex-col gap-2">
                        <Link
                          href={`/${locale}/assistants`}
                          className="text-od-violet text-[13.5px] hover:underline"
                        >
                          {t.used_assistants}
                        </Link>
                        <Link
                          href={`/${locale}/calendar`}
                          className="text-od-violet text-[13.5px] hover:underline"
                        >
                          {t.used_calendar}
                        </Link>
                        <Link
                          href={`/${locale}/knowledge`}
                          className="text-od-violet text-[13.5px] hover:underline"
                        >
                          {t.used_knowledge}
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              )
            ) : null}
          </div>
        ) : null}
      </div>

      {newOpen ? <NewServiceDialog t={t} onClose={() => setNewOpen(false)} /> : null}
    </div>
  );
}

function NewServiceDialog({ t, onClose }: { t: CatalogueDictionary; onClose: () => void }) {
  const [length, setLength] = useState(60);
  const [who, setWho] = useState(STAFF[0]);
  const [bookable, setBookable] = useState(true);

  return (
    <div
      className="fixed inset-0 z-[70] flex items-start justify-center overflow-auto p-[40px_20px]"
      style={{ background: "var(--od-scrim)" }}
    >
      <div
        className="border-od-border-9 bg-od-panel w-full max-w-[620px] overflow-hidden rounded-[14px] border"
        style={{ boxShadow: "0 26px 70px var(--od-scrim-3)" }}
      >
        <div className="border-od-border flex items-start justify-between gap-4 border-b p-[20px_24px_16px]">
          <div>
            <h2 className="text-od-text m-0 text-[19px] font-semibold">{t.dialog_title}</h2>
            <div className="text-od-muted-4 mt-1 text-[13px]">
              {t.dialog_note}
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="border-od-border-2 text-od-muted-4 hover:bg-od-raise hover:text-od-text size-[30px] flex-none cursor-pointer rounded-[7px] border bg-transparent text-[15px] leading-none"
          >
            ×
          </button>
        </div>

        <div className="p-[20px_24px]">
          <label className="text-od-text-5 mb-[6px] block text-[12.5px] font-medium">Name</label>
          <input
            placeholder={t.form_name_placeholder}
            className="border-od-border-6 bg-od-panel-deep-3 text-od-text-2 w-full rounded-lg border p-[10px_13px] text-[15px] outline-none"
          />

          <div className="mt-4 flex flex-wrap gap-3">
            <div className="min-w-0 flex-[1_1_160px]">
              <label className="text-od-text-5 mb-[6px] block text-[12.5px] font-medium">Length</label>
              <div className="flex flex-wrap gap-[6px]">
                {LENGTH_CHOICES.map((entry) => (
                  <Chip
                    key={entry}
                    label={interpolate(t.minutes, { count: entry })}
                    on={length === entry}
                    onClick={() => setLength(entry)}
                  />
                ))}
              </div>
            </div>
            <div className="min-w-0 flex-[1_1_160px]">
              <label className="text-od-text-5 mb-[6px] block text-[12.5px] font-medium">Price</label>
              <input
                placeholder={t.form_price_placeholder}
                dir="ltr"
                className="mono ltr-data border-od-border-6 bg-od-panel-deep-3 text-od-text-2 w-full rounded-lg border p-[10px_13px] text-[14px] outline-none"
              />
              <div className="text-od-faint mt-[6px] text-[12.5px]">
                {t.form_price_note}
              </div>
            </div>
          </div>

          <div className="mt-4">
            <label className="text-od-text-5 mb-[6px] block text-[12.5px] font-medium">
              {t.form_says}
            </label>
            <textarea
              rows={2}
              placeholder={t.form_says_placeholder}
              className="border-od-border-6 bg-od-panel-deep-3 text-od-text-2 w-full resize-y rounded-lg border p-[11px_13px] text-[14.5px] leading-[1.55] outline-none"
            />
          </div>

          <div className="mt-4">
            <div className="text-od-text-5 mb-[7px] text-[12.5px] font-medium">{t.form_who}</div>
            <div className="flex flex-wrap gap-[6px]">
              {STAFF.map((entry) => (
                <Chip
                  key={entry.id}
                  label={entry.labelKey ? t[entry.labelKey] : (entry.name ?? "")}
                  on={who.id === entry.id}
                  onClick={() => setWho(entry)}
                />
              ))}
            </div>
          </div>

          <div className="border-od-border-4 bg-od-panel-deep-4 mt-[18px] flex flex-wrap items-center justify-between gap-x-4 gap-y-3 rounded-[10px] border p-[14px_16px]">
            <div className="max-w-[52ch] min-w-0">
              <div className="text-od-text-5 text-[12.5px] font-medium">
                {t.bookable_heading}
              </div>
              <div className="text-od-muted-5 mt-[3px] text-[12.5px] text-pretty">
                {bookable
                  ? t.bookable_on
                  : t.bookable_off}
              </div>
            </div>
            <Switch on={bookable} onClick={() => setBookable((value) => !value)} />
          </div>
        </div>

        <div className="border-od-border bg-od-panel-deep-2 flex flex-wrap justify-end gap-[10px] border-t p-[16px_24px]">
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
            className="border-od-stroke bg-od-raise-10 text-od-text-2 cursor-pointer rounded-[7px] border p-[9px_17px] font-semibold"
          >
            {t.save}
          </button>
        </div>
      </div>
    </div>
  );
}
