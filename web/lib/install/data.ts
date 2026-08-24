/**
 * Everything the install wizard offers.
 *
 * Every piece of prose is a key into `locales/<lang>/install.json`. What stays a
 * literal here is data: model identifiers, endpoints, latencies, download sizes,
 * a language's own name, and the sample of how that language writes a date.
 */

import type { InstallDictionary } from "@/app/[locale]/install/page";

export type Key = keyof InstallDictionary;

export const QUICK_STEPS = [
  "language",
  "mode",
  "channels",
  "model",
  "voice",
  "check",
  "admin",
  "installing",
  "line",
  "trade",
  "greeting",
  "done",
] as const;

export const CUSTOM_STEPS = [
  "language",
  "mode",
  "channels",
  "model",
  "voice",
  "check",
  "database",
  "host",
  "admin",
  "installing",
  "line",
  "trade",
  "greeting",
  "done",
] as const;

export type Step = (typeof CUSTOM_STEPS)[number];

export const STEP_LABELS: Record<Step, Key> = {
  language: "step_language",
  mode: "step_mode",
  channels: "step_channels",
  model: "step_model",
  voice: "step_voice",
  check: "step_check",
  database: "step_database",
  host: "step_host",
  admin: "step_admin",
  installing: "step_installing",
  line: "step_line",
  trade: "step_trade",
  greeting: "step_greeting",
  done: "step_done",
};

export type Channel = {
  id: string;
  /** A platform keeps its own name; a channel that is ours is named in copy. */
  name?: Key;
  nameText?: string;
  note: Key;
  /** Download weight of the channel's container, in megabytes. */
  mb: number;
  core?: boolean;
  /**
   * A drawn glyph, for the channels that are not a company - a phone line, a web chat,
   * SMS, email. The rest are looked up in the vendored marks by `id`, so they carry the
   * owner's logo and need nothing here.
   */
  glyph?: string;
};

export const CHANNELS: Channel[] = [
  { id: "phone", glyph: "☎", name: "ch_phone_name", note: "ch_phone_note", mb: 210, core: true },
  { id: "web", glyph: "◍", name: "ch_web_name", note: "ch_web_note", mb: 220 },
  { id: "whatsapp", nameText: "WhatsApp", note: "ch_whatsapp_note", mb: 1800 },
  { id: "telegram", nameText: "Telegram", note: "ch_telegram_note", mb: 2600 },
  { id: "sms", glyph: "▤", name: "ch_sms_name", note: "ch_sms_note", mb: 1800 },
  { id: "email", glyph: "✉", name: "ch_email_name", note: "ch_email_note", mb: 900 },
  { id: "messenger", nameText: "Facebook Messenger", note: "ch_messenger_note", mb: 2100 },
  { id: "instagram", name: "ch_instagram_name", note: "ch_instagram_note", mb: 3200 },
  { id: "signal", nameText: "Signal", note: "ch_signal_note", mb: 4100 },
  { id: "discord", nameText: "Discord", note: "ch_discord_note", mb: 2400 },
  { id: "matrix", nameText: "Matrix", note: "ch_matrix_note", mb: 2600 },
];

export type Engine = {
  /** A product keeps its own name; "on this machine" is ours to word. */
  label?: Key;
  labelText?: string;
  latency?: string;
  latencyKey?: Key;
  size: string | null;
  body: Key;
  /** `ok` means it runs on hardware the customer controls. */
  tone: "ok" | "warn";
  endpoint?: string;
};

export const STT: Record<string, Engine> = {
  local: { label: "stt_local_label", latency: "~0.3 s", size: "1.5 GB", body: "stt_local_body", tone: "ok" },
  deepgram: { labelText: "Deepgram", latency: "~0.15 s", size: null, body: "stt_deepgram_body", tone: "warn" },
  azure: { labelText: "Azure Speech", latency: "~0.25 s", size: null, body: "stt_azure_body", tone: "warn" },
  google: { labelText: "Google Speech-to-Text", latency: "~0.25 s", size: null, body: "stt_google_body", tone: "warn" },
  eleven: { labelText: "ElevenLabs Scribe", latency: "~0.3 s", size: null, body: "stt_eleven_body", tone: "warn" },
  openai: { labelText: "OpenAI Whisper API", latency: "~0.35 s", size: null, body: "stt_openai_body", tone: "warn" },
  cartesia: { labelText: "Cartesia Ink", latency: "~0.2 s", size: null, body: "stt_cartesia_body", tone: "warn" },
  custom: { label: "stt_custom_label", latencyKey: "latency_yours", size: null, body: "stt_custom_body", tone: "ok", endpoint: "http://192.168.1.20:9000/v1/audio/transcriptions" },
};

export const TTS: Record<string, Engine> = {
  local: { label: "tts_local_label", latency: "~0.1 s", size: "310 MB", body: "tts_local_body", tone: "ok" },
  eleven: { labelText: "ElevenLabs", latency: "~0.4 s", size: null, body: "tts_eleven_body", tone: "warn" },
  azure: { labelText: "Azure Neural TTS", latency: "~0.3 s", size: null, body: "tts_azure_body", tone: "warn" },
  cartesia: { labelText: "Cartesia Sonic", latency: "~0.2 s", size: null, body: "tts_cartesia_body", tone: "warn" },
  deepgram: { labelText: "Deepgram Aura", latency: "~0.15 s", size: null, body: "tts_deepgram_body", tone: "warn" },
  google: { labelText: "Google Cloud TTS", latency: "~0.3 s", size: null, body: "tts_google_body", tone: "warn" },
  openai: { labelText: "OpenAI TTS", latency: "~0.4 s", size: null, body: "tts_openai_body", tone: "warn" },
  custom: { label: "tts_custom_label", latencyKey: "latency_yours", size: null, body: "tts_custom_body", tone: "ok", endpoint: "http://192.168.1.20:9100/v1/audio/speech" },
};

/** Providers that offer both halves, so one key and one agreement can cover both. */
export const BOTH_HALVES: Record<string, string> = {
  azure: "Azure",
  eleven: "ElevenLabs",
  google: "Google",
  openai: "OpenAI",
  cartesia: "Cartesia",
  deepgram: "Deepgram",
};

export type Trade = { id: string; label: Key; note: Key };

export const TRADES: Trade[] = [
  { id: "clinic", label: "trade_clinic", note: "trade_clinic_note" },
  { id: "trades", label: "trade_trades", note: "trade_trades_note" },
  { id: "restaurant", label: "trade_restaurant", note: "trade_restaurant_note" },
  { id: "garage", label: "trade_garage", note: "trade_garage_note" },
  { id: "property", label: "trade_property", note: "trade_property_note" },
  { id: "salon", label: "trade_salon", note: "trade_salon_note" },
  { id: "office", label: "trade_office", note: "trade_office_note" },
  { id: "empty", label: "trade_empty", note: "trade_empty_note" },
];

/** What a trade seeds into the catalogue. Every line is copy the customer edits. */
export type Seed = {
  services: Key[];
  fields: Key[];
  rules: Key[];
  prompt?: Key;
  qa: number;
};

export const SEEDS: Record<string, Seed> = {
  clinic: {
    services: ["seed_clinic_service1", "seed_clinic_service2", "seed_clinic_service3", "seed_clinic_service4"],
    fields: ["seed_clinic_field1", "seed_clinic_field2", "seed_clinic_field3"],
    rules: ["seed_clinic_rule1", "seed_clinic_rule2"],
    prompt: "seed_clinic_prompt",
    qa: 8,
  },
  trades: {
    services: ["seed_trades_service1", "seed_trades_service2", "seed_trades_service3", "seed_trades_service4"],
    fields: ["seed_trades_field1", "seed_trades_field2", "seed_trades_field3"],
    rules: ["seed_trades_rule1", "seed_trades_rule2"],
    prompt: "seed_trades_prompt",
    qa: 7,
  },
  restaurant: {
    services: ["seed_restaurant_service1", "seed_restaurant_service2", "seed_restaurant_service3", "seed_restaurant_service4"],
    fields: ["seed_restaurant_field1", "seed_restaurant_field2", "seed_restaurant_field3"],
    rules: ["seed_restaurant_rule1", "seed_restaurant_rule2"],
    prompt: "seed_restaurant_prompt",
    qa: 9,
  },
  garage: {
    services: ["seed_garage_service1", "seed_garage_service2", "seed_garage_service3", "seed_garage_service4"],
    fields: ["seed_garage_field1", "seed_garage_field2", "seed_garage_field3"],
    rules: ["seed_garage_rule1", "seed_garage_rule2"],
    prompt: "seed_garage_prompt",
    qa: 6,
  },
  property: {
    services: ["seed_property_service1", "seed_property_service2", "seed_property_service3"],
    fields: ["seed_property_field1", "seed_property_field2", "seed_property_field3"],
    rules: ["seed_property_rule1", "seed_property_rule2"],
    prompt: "seed_property_prompt",
    qa: 7,
  },
  salon: {
    services: ["seed_salon_service1", "seed_salon_service2", "seed_salon_service3", "seed_salon_service4"],
    fields: ["seed_salon_field1", "seed_salon_field2", "seed_salon_field3"],
    rules: ["seed_salon_rule1", "seed_salon_rule2"],
    prompt: "seed_salon_prompt",
    qa: 6,
  },
  office: {
    services: ["seed_office_service1", "seed_office_service2", "seed_office_service3"],
    fields: ["seed_office_field1", "seed_office_field2", "seed_office_field3"],
    rules: ["seed_office_rule1", "seed_office_rule2"],
    prompt: "seed_office_prompt",
    qa: 5,
  },
  empty: { services: [], fields: [], rules: [], qa: 0 },
};

/**
 * A language names itself, and shows how it writes a date. Only the parenthetical
 * description is ours, so only that is a key.
 */
export type SystemLanguage = { id: string; native: string; english: Key; fmt: string };

export const SYSTEM_LANGUAGES: SystemLanguage[] = [
  { id: "de-AT", native: "Deutsch (Österreich)", english: "lang_de_AT", fmt: "21.08.2026 · 14:30" },
  { id: "de", native: "Deutsch (Deutschland)", english: "lang_de", fmt: "21.08.2026 · 14:30" },
  { id: "en", native: "English", english: "lang_en", fmt: "21 August 2026 · 14:30" },
  { id: "ar", native: "العربية", english: "lang_ar", fmt: "٢١ أغسطس ٢٠٢٦ · 14:30" },
  { id: "tr", native: "Türkçe", english: "lang_tr", fmt: "21.08.2026 · 14:30" },
  { id: "fr", native: "Français", english: "lang_fr", fmt: "21 août 2026 · 14:30" },
  { id: "it", native: "Italiano", english: "lang_it", fmt: "21 agosto 2026 · 14:30" },
  { id: "hr", native: "Hrvatski", english: "lang_hr", fmt: "21.08.2026 · 14:30" },
  { id: "sr", native: "Srpski", english: "lang_sr", fmt: "21.08.2026 · 14:30" },
  { id: "pl", native: "Polski", english: "lang_pl", fmt: "21.08.2026 · 14:30" },
  { id: "hu", native: "Magyar", english: "lang_hu", fmt: "2026.08.21 · 14:30" },
  { id: "ro", native: "Română", english: "lang_ro", fmt: "21.08.2026 · 14:30" },
  { id: "cs", native: "Čeština", english: "lang_cs", fmt: "21.08.2026 · 14:30" },
  { id: "sk", native: "Slovenčina", english: "lang_sk", fmt: "21.08.2026 · 14:30" },
  { id: "sl", native: "Slovenščina", english: "lang_sl", fmt: "21.08.2026 · 14:30" },
  { id: "es", native: "Español", english: "lang_es", fmt: "21 de agosto de 2026 · 14:30" },
  { id: "nl", native: "Nederlands", english: "lang_nl", fmt: "21 augustus 2026 · 14:30" },
  { id: "uk", native: "Українська", english: "lang_uk", fmt: "21.08.2026 · 14:30" },
  { id: "ru", native: "Русский", english: "lang_ru", fmt: "21.08.2026 · 14:30" },
  { id: "sq", native: "Shqip", english: "lang_sq", fmt: "21.08.2026 · 14:30" },
  { id: "fa", native: "فارسی", english: "lang_fa", fmt: "۳۱ مرداد ۱۴۰۵ · 14:30" },
];

/** Memory each open-weight model needs, in gigabytes, and what it weighs on disk. */
export const MODEL_RAM_GB: Record<string, number> = {
  "llama-3.1-8b": 8,
  "qwen-2.5-14b": 16,
  "llama-3.3-70b": 32,
};

export const MODEL_WEIGHT_GB: Record<string, number> = {
  "llama-3.1-8b": 4.9,
  "qwen-2.5-14b": 8.4,
  "llama-3.3-70b": 40,
};

export const LOCAL_MODELS: { id: string; size: string; body: Key; warn: Key | null }[] = [
  { id: "llama-3.1-8b", size: "4.9 GB", body: "model_llama_31_8b_body", warn: null },
  { id: "qwen-2.5-14b", size: "8.4 GB", body: "model_qwen_25_14b_body", warn: "model_qwen_25_14b_warn" },
  { id: "llama-3.3-70b", size: "40 GB", body: "model_llama_33_70b_body", warn: "model_llama_33_70b_warn" },
];

export type Provider = {
  id: string;
  /** Four are companies; the fifth is a description of anything else. */
  name?: Key;
  nameText?: string;
  mark: string;
  hue: number;
  endpoint: string;
  cost: Key;
  models: { id?: string; idKey?: Key; tag?: Key; latency?: string; latencyKey?: Key; body: Key }[];
};

export const PROVIDERS: Provider[] = [
  {
    id: "anthropic",
    nameText: "Anthropic",
    mark: "A",
    hue: 40,
    endpoint: "https://api.anthropic.com/v1/messages",
    cost: "provider_anthropic_cost",
    models: [
      { id: "claude-haiku-4-5", latency: "~0.4 s", tag: "tag_fastest", body: "model_claude_haiku_4_5_body" },
      { id: "claude-sonnet-4-5", latency: "~0.9 s", body: "model_claude_sonnet_4_5_body" },
      { id: "claude-opus-4-1", latency: "~1.8 s", body: "model_claude_opus_4_1_body" },
    ],
  },
  {
    id: "openai",
    nameText: "OpenAI",
    mark: "O",
    hue: 165,
    endpoint: "https://api.openai.com/v1/chat/completions",
    cost: "provider_openai_cost",
    models: [
      { id: "gpt-4.1-mini", latency: "~0.4 s", tag: "tag_fastest", body: "model_gpt_41_mini_body" },
      { id: "gpt-4.1", latency: "~0.8 s", body: "model_gpt_41_body" },
      { id: "gpt-4o", latency: "~0.7 s", body: "model_gpt_4o_body" },
    ],
  },
  {
    id: "mistral",
    nameText: "Mistral",
    mark: "M",
    hue: 55,
    endpoint: "https://api.mistral.ai/v1/chat/completions",
    cost: "provider_mistral_cost",
    models: [
      { id: "mistral-small-latest", latency: "~0.4 s", tag: "tag_fastest", body: "model_mistral_small_latest_body" },
      { id: "mistral-large-latest", latency: "~0.9 s", body: "model_mistral_large_latest_body" },
    ],
  },
  {
    id: "groq",
    nameText: "Groq",
    mark: "G",
    hue: 20,
    endpoint: "https://api.groq.com/openai/v1/chat/completions",
    cost: "provider_groq_cost",
    models: [
      { id: "llama-3.3-70b-versatile", latency: "~0.2 s", tag: "tag_fastest", body: "model_llama_33_70b_versatile_body" },
      { id: "llama-3.1-8b-instant", latency: "~0.1 s", body: "model_llama_31_8b_instant_body" },
    ],
  },
  {
    id: "custom",
    name: "provider_custom_name",
    mark: "···",
    hue: 260,
    endpoint: "https://",
    cost: "provider_custom_cost",
    models: [
      { idKey: "model_custom_name", latencyKey: "model_custom_latency", body: "model_type_the_model_name_body" },
    ],
  },
];

export const SETUP_VOICES: { id: string; name: string; desc: Key }[] = [
  { id: "thorsten", name: "Thorsten", desc: "voice_thorsten_desc" },
  { id: "eva", name: "Eva", desc: "voice_eva_desc" },
  { id: "amy", name: "Amy", desc: "voice_amy_desc" },
];

/** Values the installer would read off the machine. Placeholders until `api/` exists. */
export const MACHINE = {
  version: "v1.4.2",
  configPath: "/config/telagent.yaml",
  logPath: "/var/log/telagent/install.log",
  diskFree: "disk_free" as Key,
  ramGb: 16,
  hostname: "telagent.wagner-partner.local",
  business: "Wagner & Partner",
  number: "+43 1 987 6543",
  adminEmail: "mohamed@wagner-partner.at",
};
