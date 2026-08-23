/**
 * What the numbers screen offers. Provider credentials are described here as fields;
 * the values themselves never live in the client — they are written to the encrypted
 * columns behind the API (§B9.2).
 *
 * Every piece of prose is a key into `locales/<lang>/numbers.json`. What stays a
 * literal here is data: phone numbers, device model names, placeholders that are
 * examples of machine input, and product names.
 */

import type { NumbersDictionary } from "@/app/[locale]/numbers/page";

export type Key = keyof NumbersDictionary;

export type PhoneKind = {
  id: string;
  label: Key;
  note: Key;
  stepTitle: Key;
  stepBody: Key;
  pairTitle: Key;
  name: Key;
};

export const PHONE_KINDS: PhoneKind[] = [
  {
    id: "desk",
    label: "kind_desk",
    note: "kind_desk_note",
    stepTitle: "kind_desk_step",
    stepBody: "kind_desk_body",
    pairTitle: "kind_desk_pair",
    name: "kind_desk_name",
  },
  {
    id: "dect",
    label: "kind_dect",
    note: "kind_dect_note",
    stepTitle: "kind_dect_step",
    stepBody: "kind_dect_body",
    pairTitle: "kind_dect_pair",
    name: "kind_dect_name",
  },
  {
    id: "app",
    label: "kind_app",
    note: "kind_app_note",
    stepTitle: "kind_app_step",
    stepBody: "kind_app_body",
    pairTitle: "kind_app_pair",
    name: "kind_app_name",
  },
];

/** Model names are what is printed on the box; where it sits and what it is are copy. */
export const DEVICES: {
  mark: string;
  name?: string;
  nameKey?: Key;
  detail: Key;
  where?: string;
  whereKey?: Key;
  ext: number;
  ok: boolean;
}[] = [
  { mark: "☎", name: "Snom D735", detail: "dev_provisioned", whereKey: "where_reception", ext: 10, ok: true },
  { mark: "⌁", name: "Gigaset DECT handset", detail: "dev_cordless", whereKey: "where_service2", ext: 12, ok: true },
  { mark: "▭", nameKey: "kind_app", detail: "dev_laptop", where: "Mohamed", ext: 21, ok: true },
  { mark: "▭", nameKey: "kind_app", detail: "dev_phone_stale", where: "Georg Wagner", ext: 22, ok: false },
];

export type Direction = "in" | "out" | "whatsapp";

export const DIRECTIONS: Record<
  Direction,
  { label: Key; icon: string; color: string; border: string; background: string }
> = {
  in: {
    label: "dir_in",
    icon: "↙",
    color: "var(--od-green-text)",
    border: "var(--od-green-border)",
    background: "rgba(63,185,132,.10)",
  },
  out: {
    label: "dir_out",
    icon: "↗",
    color: "var(--od-violet-3)",
    border: "var(--od-violet-border)",
    background: "rgba(139,124,255,.12)",
  },
  whatsapp: {
    // WhatsApp is a product name and is never translated.
    label: "whatsapp_name",
    icon: "◆",
    color: "var(--od-green-text)",
    border: "var(--od-green-border)",
    background: "rgba(63,185,132,.10)",
  },
};

export type NumberRow = {
  id: string;
  number: string;
  label: Key;
  answeredBy?: string;
  answeredByKey?: Key;
  type: "agent" | "human";
  fallback: Key;
  volume: number;
  volumeUnit: "calls" | "chats" | "none";
  dir: Direction[];
  main?: boolean;
  pending?: "carrier" | "verify";
};

export const NUMBERS: NumberRow[] = [
  {
    id: "main",
    number: "+43 1 987 6543",
    label: "num_main_label",
    answeredBy: "Lena",
    type: "agent",
    fallback: "num_main_fallback",
    volume: 128,
    volumeUnit: "calls",
    main: true,
    dir: ["in", "out"],
  },
  {
    id: "partners",
    number: "+43 1 987 6544",
    label: "num_partners_label",
    answeredByKey: "answered_reception",
    type: "human",
    fallback: "num_partners_fallback",
    volume: 34,
    volumeUnit: "calls",
    dir: ["in"],
  },
  {
    id: "salzburg",
    number: "+43 662 884 190",
    label: "num_salzburg_label",
    answeredByKey: "answered_voicemail",
    type: "human",
    fallback: "num_salzburg_fallback",
    volume: 0,
    volumeUnit: "none",
    dir: ["in"],
    pending: "carrier",
  },
  {
    id: "test",
    number: "+43 720 072 513",
    label: "num_test_label",
    answeredBy: "Anna",
    type: "agent",
    fallback: "num_test_fallback",
    volume: 6,
    volumeUnit: "calls",
    dir: ["out"],
  },
  {
    id: "whatsapp",
    number: "+43 1 987 6543",
    label: "num_whatsapp_label",
    answeredBy: "Mark",
    type: "agent",
    fallback: "num_whatsapp_fallback",
    volume: 96,
    volumeUnit: "chats",
    dir: ["whatsapp"],
  },
];

export type ProviderField = {
  key: string;
  label: Key;
  required: boolean;
  min?: number;
  secret?: boolean;
  placeholder?: string;
  placeholderKey?: Key;
  help: Key;
  emptyLabel?: string;
  options?: [string, Key][];
};

export type Provider = {
  id: string;
  channel: "voice" | "whatsapp";
  name?: string;
  nameKey?: Key;
  ready: boolean;
  note?: Key;
  after?: Key;
  fields: ProviderField[];
};

export const PROVIDERS: Provider[] = [
  {
    id: "twilio",
    channel: "voice",
    name: "Twilio",
    ready: true,
    note: "provider_twilio_note",
    after: "provider_twilio_after",
    fields: [
      {
        key: "sid",
        label: "field_sid",
        required: true,
        min: 10,
        placeholder: "AC00000000000000000000000000000000",
        help: "field_sid_help",
      },
      {
        key: "token",
        label: "field_token",
        required: true,
        min: 10,
        secret: true,
        placeholderKey: "field_token_placeholder",
        help: "field_token_help",
      },
      {
        key: "number",
        label: "field_number",
        required: true,
        min: 6,
        placeholder: "+43 720 112 931",
        help: "field_number_help",
      },
      {
        key: "region",
        label: "field_region",
        required: false,
        emptyLabel: "nearest",
        help: "field_region_help",
        options: [
          ["nearest", "region_nearest"],
          ["frankfurt", "region_frankfurt"],
          ["dublin", "region_dublin"],
          ["london", "region_london"],
          ["ashburn", "region_ashburn"],
          ["umatilla", "region_umatilla"],
          ["singapore", "region_singapore"],
          ["tokyo", "region_tokyo"],
          ["sydney", "region_sydney"],
          ["sao-paulo", "region_saopaulo"],
        ],
      },
    ],
  },
  { id: "sipgate", channel: "voice", name: "sipgate", ready: false, fields: [] },
  { id: "easybell", channel: "voice", name: "easybell", ready: false, fields: [] },
  {
    id: "generic",
    channel: "voice",
    nameKey: "provider_generic",
    ready: false,
    fields: [],
  },
  {
    id: "meta",
    channel: "whatsapp",
    nameKey: "provider_meta",
    ready: true,
    note: "provider_meta_note",
    after: "provider_meta_after",
    fields: [
      {
        key: "wanumber",
        label: "field_number",
        required: true,
        min: 6,
        placeholder: "+43 720 112 931",
        help: "field_wanumber_help",
      },
      {
        key: "waba",
        label: "field_waba",
        required: true,
        min: 8,
        placeholder: "104938271056432",
        help: "field_waba_help",
      },
      {
        key: "phoneid",
        label: "field_phoneid",
        required: true,
        min: 8,
        placeholder: "118273645019283",
        help: "field_phoneid_help",
      },
      {
        key: "watoken",
        label: "field_watoken",
        required: true,
        min: 10,
        secret: true,
        placeholderKey: "field_watoken_placeholder",
        help: "field_watoken_help",
      },
      {
        key: "display",
        label: "field_display",
        required: true,
        min: 3,
        placeholder: "Wagner & Partner",
        help: "field_display_help",
      },
    ],
  },
  {
    id: "twiliowa",
    channel: "whatsapp",
    nameKey: "provider_twiliowa",
    ready: false,
    fields: [],
  },
];
