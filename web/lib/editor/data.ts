/**
 * The assistant editor. The rail is grouped by what happens in a call, in order —
 * the phone rings, it works out what they want, it does something, they hang up.
 * That ordering is the point: a capability is easier to judge in the place it fires.
 *
 * Every piece of prose is a key into `locales/<lang>/editor.json`. What stays a
 * literal here is data: hostnames, calendar names, model identifiers, product
 * names, and the opening lines, which are what the assistant actually says.
 */

import type { EditorDictionary } from "@/app/[locale]/assistants/[id]/page";

export type Key = keyof EditorDictionary;

export type PanelId =
  | "contacts"
  | "persona"
  | "instructions"
  | "knowledge"
  | "booking"
  | "forward"
  | "apps"
  | "webhooks"
  | "email"
  | "sms";

export type RailRow = {
  icon: string;
  title: Key;
  panel: PanelId;
  /** A row's summary is either copy or a piece of data; never both. */
  value?: Key;
  valueText?: string;
  hint?: Key;
  enabled?: boolean;
  isNew?: boolean;
};

export const GROUPS: { id: string; label: Key; note: Key; rows: RailRow[] }[] = [
  {
    id: "ring",
    label: "group_ring",
    note: "group_ring_note",
    rows: [
      { icon: "contact", title: "row_contacts", panel: "contacts", value: "val_contacts", isNew: true },
      { icon: "cube", title: "row_persona", panel: "persona", valueText: "Carla · Lena, de-AT" },
    ],
  },
  {
    id: "understand",
    label: "group_understand",
    note: "group_understand_note",
    rows: [
      { icon: "spark", title: "row_instructions", panel: "instructions", value: "val_instructions" },
      { icon: "help", title: "row_knowledge", panel: "knowledge", value: "val_knowledge" },
    ],
  },
  {
    id: "act",
    label: "group_act",
    note: "group_act_note",
    rows: [
      { icon: "calendar", title: "row_booking", panel: "booking", valueText: "CalDAV" },
      { icon: "forward", title: "row_forward", panel: "forward", value: "val_forward" },
      { icon: "plug", title: "row_apps", panel: "apps", value: "val_apps" },
      { icon: "webhook", title: "row_webhooks", panel: "webhooks", enabled: false, hint: "hint_webhooks" },
    ],
  },
  {
    id: "after",
    label: "group_after",
    note: "group_after_note",
    rows: [
      { icon: "mail", title: "row_email", panel: "email", value: "val_email" },
      { icon: "sms", title: "row_sms", panel: "sms", enabled: false, hint: "hint_sms" },
    ],
  },
];

/** A panel's heading is the same words as its rail row, so it reuses that key. */
export const PANEL_META: Record<PanelId, { title: Key; blurb: Key }> = {
  contacts: { title: "row_contacts", blurb: "blurb_contacts" },
  persona: { title: "row_persona", blurb: "blurb_persona" },
  instructions: { title: "row_instructions", blurb: "blurb_instructions" },
  knowledge: { title: "row_knowledge", blurb: "blurb_knowledge" },
  booking: { title: "row_booking", blurb: "blurb_booking" },
  forward: { title: "row_forward", blurb: "blurb_forward" },
  apps: { title: "row_apps", blurb: "blurb_apps" },
  webhooks: { title: "row_webhooks", blurb: "blurb_webhooks" },
  email: { title: "row_email", blurb: "blurb_email" },
  sms: { title: "row_sms", blurb: "blurb_sms" },
};

/**
 * A row's right-hand side is one of four things. It used to be a single string
 * compared against "on" / "off" / "add", which made display text into control
 * flow — the trap this shape exists to close.
 */
export type GenericValue =
  | { kind: "toggle"; on: boolean }
  | { kind: "add" }
  | { kind: "data"; text: string }
  | { kind: "copy"; key: Key };

export type GenericRow = {
  id: string;
  /** A product's own name is a literal; everything else is a key. */
  label?: Key;
  labelText?: string;
  help?: Key;
  helpText?: string;
  value: GenericValue;
};

export type GenericSection = {
  id: string;
  label: Key;
  meta?: Key;
  rows: GenericRow[];
  notes?: Key[];
};

const on: GenericValue = { kind: "toggle", on: true };
const off: GenericValue = { kind: "toggle", on: false };

export const GENERIC: Partial<Record<PanelId, GenericSection[]>> = {
  contacts: [
    {
      id: "matched",
      label: "c_matched_on",
      meta: "val_contacts",
      rows: [
        { id: "number", label: "c_number", help: "c_number_help", value: on },
        { id: "name", label: "c_name", help: "c_name_help", value: on },
        { id: "dob", label: "c_dob", help: "c_dob_help", value: on },
        { id: "ref", label: "c_ref", help: "c_ref_help", value: on },
        { id: "email", label: "c_email", help: "c_email_help", value: off },
      ],
    },
    {
      id: "nomatch",
      label: "c_nomatch",
      rows: [
        { id: "create", label: "c_create", help: "c_create_help", value: on },
        { id: "ask", label: "c_ask", help: "c_ask_help", value: on },
      ],
      notes: ["c_note"],
    },
  ],
  booking: [
    {
      id: "calendar",
      label: "b_calendar",
      meta: "b_calendar_meta",
      rows: [
        {
          id: "server",
          label: "b_server",
          help: "b_server_help",
          value: { kind: "data", text: "cal.wagner-partner.local" },
        },
        { id: "which", label: "b_which", value: { kind: "data", text: "Reception" } },
        { id: "sync", label: "b_sync", value: { kind: "copy", key: "b_sync_value" } },
      ],
    },
    {
      id: "rules",
      label: "b_rules",
      rows: [
        { id: "slot", label: "b_slot", help: "b_slot_help", value: { kind: "copy", key: "b_slot_value" } },
        {
          id: "notice",
          label: "b_notice",
          help: "b_notice_help",
          value: { kind: "copy", key: "b_notice_value" },
        },
        { id: "ahead", label: "b_ahead", value: { kind: "copy", key: "b_ahead_value" } },
        {
          id: "offered",
          label: "b_offered",
          help: "b_offered_help",
          value: { kind: "data", text: "2" },
        },
      ],
    },
    {
      id: "also",
      label: "b_also",
      rows: [
        { id: "move", label: "b_move", help: "b_move_help", value: on },
        { id: "cancel", label: "b_cancel", help: "b_cancel_help", value: on },
      ],
    },
  ],
  forward: [
    {
      id: "rules",
      label: "f_rules",
      meta: "val_forward",
      rows: [
        { id: "asks", label: "f_asks", help: "f_asks_help", value: on },
        { id: "distress", label: "f_distress", help: "f_distress_help", value: on },
      ],
    },
    {
      id: "where",
      label: "f_where",
      rows: [
        {
          id: "first",
          label: "f_first",
          help: "f_first_help",
          value: { kind: "copy", key: "f_first_value" },
        },
        { id: "then", label: "f_then", help: "f_then_help", value: { kind: "copy", key: "f_then_value" } },
        {
          id: "nobody",
          label: "f_nobody",
          help: "f_nobody_help",
          value: { kind: "copy", key: "f_nobody_value" },
        },
      ],
      notes: ["f_note"],
    },
  ],
  apps: [
    {
      id: "connected",
      label: "a_connected",
      meta: "a_connected_meta",
      rows: [
        {
          id: "caldav",
          label: "a_caldav",
          help: "a_caldav_help",
          value: { kind: "copy", key: "a_in_use" },
        },
        { id: "smtp", label: "a_smtp", help: "a_smtp_help", value: { kind: "copy", key: "a_in_use" } },
        {
          id: "catalogue",
          label: "a_catalogue",
          help: "a_catalogue_help",
          value: { kind: "copy", key: "a_in_use" },
        },
      ],
    },
    {
      id: "available",
      label: "a_available",
      rows: [
        // WhatsApp is a product name, so the row's own label is a literal.
        { id: "whatsapp", labelText: "WhatsApp", help: "a_whatsapp_help", value: { kind: "add" } },
        { id: "payment", label: "a_payment", help: "a_payment_help", value: { kind: "add" } },
      ],
      notes: ["a_note"],
    },
  ],
  sms: [
    {
      id: "notyet",
      label: "s_notyet",
      rows: [
        {
          id: "sender",
          label: "s_sender",
          help: "s_sender_help",
          value: { kind: "copy", key: "s_sender_value" },
        },
        { id: "when", label: "s_when", help: "s_when_help", value: { kind: "copy", key: "dash" } },
        {
          id: "message",
          label: "s_message",
          help: "s_message_help",
          value: { kind: "copy", key: "dash" },
        },
      ],
      notes: ["s_note"],
    },
  ],
  email: [
    {
      id: "when",
      label: "e_when",
      meta: "val_email",
      rows: [
        { id: "after", label: "e_after", help: "e_after_help", value: on },
        { id: "booking", label: "e_booking", help: "e_booking_help", value: on },
        { id: "failure", label: "e_failure", help: "e_failure_help", value: on },
      ],
    },
    {
      id: "who",
      label: "e_who",
      rows: [
        { id: "caller", label: "e_caller", help: "e_caller_help", value: on },
        { id: "fixed", label: "e_fixed", helpText: "office@wagner-partner.at", value: on },
      ],
      notes: ["e_note"],
    },
  ],
};

/** A crawled site is named by its domain; the rest are documents with titles. */
export const SOURCES: {
  id: string;
  name?: Key;
  nameText?: string;
  kind: string;
  meta: Key;
  on: boolean;
}[] = [
  { id: "hours", name: "src_hours", kind: "PDF", meta: "src_hours_meta", on: true },
  { id: "site", nameText: "wagner-partner.at", kind: "WWW", meta: "src_site_meta", on: true },
  { id: "faq", name: "src_faq", kind: "Q&A", meta: "src_faq_meta", on: true },
  { id: "terms", name: "src_terms", kind: "MD", meta: "src_terms_meta", on: false },
  { id: "old", name: "src_old", kind: "DOC", meta: "src_old_meta", on: false },
];

/**
 * What the assistant says on the phone is content, not interface — the same rule
 * that keeps a transcript verbatim. The tag above each line is interface.
 */
export const OPENING_LINES: { id: string; tag: Key; text: string }[] = [
  {
    id: "known",
    tag: "tag_known",
    text: "Wagner & Partner, good morning Ms Gruber. This call is recorded. How can I help?",
  },
  {
    id: "unknown",
    tag: "tag_unknown",
    text: "Wagner & Partner, good morning. This call is recorded. How can I help you?",
  },
  {
    id: "ooh",
    tag: "tag_ooh",
    text: "Wagner & Partner. We are closed right now — may I take a message?",
  },
];

export const PROMPT_TEMPLATES: { id: string; label: Key }[] = [
  { id: "reception", label: "tpl_reception" },
  { id: "ooh", label: "tpl_ooh" },
  { id: "overflow", label: "tpl_overflow" },
  { id: "blank", label: "tpl_blank" },
];

/** Written by the customer, in the language their callers speak. Not copy. */
export const PROMPT_TEXT = `You answer the phone for Wagner & Partner.

Book, move and confirm appointments from the catalogue. Offer the next two free slots rather than reading out the whole week.

Never quote a price that is not in the catalogue, and never estimate one. If a caller asks about a price you cannot see, say a colleague will ring back.

Hand the call to a person if the caller asks for one, sounds distressed, or asks about an invoice.`;

/** The event name is an identifier your software matches on, so it stays verbatim. */
export const HOOKS: {
  name: string;
  desc: Key;
  badges: { key: Key; inbound?: boolean }[];
}[] = [
  {
    name: "call.ended",
    desc: "hook_ended_desc",
    badges: [{ key: "badge_outbound" }, { key: "badge_healthy" }],
  },
  {
    name: "stock_check",
    desc: "hook_stock_desc",
    badges: [{ key: "badge_inbound", inbound: true }, { key: "badge_avg" }],
  },
  {
    name: "appointment.booked",
    desc: "hook_booked_desc",
    badges: [{ key: "badge_outbound" }, { key: "badge_healthy" }],
  },
];

/** A value is the product's own name plus, sometimes, a phrase about where it runs. */
export const TECHNICAL: {
  id: string;
  label: Key;
  help: Key;
  valueText?: string;
  valueKey?: Key;
  suffix?: Key;
}[] = [
  { id: "model", label: "t_model", help: "t_model_help", valueText: "claude-haiku-4-5 · Anthropic" },
  { id: "stt", label: "t_stt", help: "t_stt_help", valueText: "Whisper", suffix: "on_this_machine" },
  { id: "voice", label: "t_voice", help: "t_voice_help", valueText: "Piper", suffix: "on_this_machine" },
  { id: "answer", label: "t_answer", help: "t_answer_help", valueKey: "t_answer_value" },
  { id: "endpoint", label: "t_endpoint", help: "t_endpoint_help", valueKey: "t_endpoint_value" },
  { id: "maxlen", label: "t_maxlen", help: "t_maxlen_help", valueKey: "t_maxlen_value" },
];
