# OpenDial — Complete Build Specification

> Open-source gateway that connects any phone line to any AI model.
> Self-hosted. Bring your own keys. Full control over who gets through.

**Project:** OpenDial · `opendial.dev` · AGPL-3.0 · maintained by Dpro GmbH (Vienna)
**Hosted edition (later):** OpenDial Cloud

This document is the single source of truth for design and implementation.
Section A is for the designer. Section B is for the developer. Read both.

---

# START HERE — Milestone 0

**Goal:** one real phone call, answered by an AI voice, message captured, transcript printed.

**Not in this milestone:** no web UI, no Docker, no database, no routing rules, no
provider abstraction. One script in a terminal.

**Time box: two weeks.** If it isn't working by then, the constraint is time, not
architecture — and knowing that early is worth more than any feature.

## Step 1 — 3CX extension (15 minutes)

In the 3CX management console:

1. Create a new extension — number `999`, name `AI Agent`
2. Note down: **SIP username**, **SIP password (auth ID)**, **PBX host**, **port** (usually 5060)
3. Disable voicemail on this extension — you want the agent to answer, not the mailbox
4. Do **not** touch the main company line yet. Nothing routes to 999 except your own
   test calls from an internal phone.

**Verify before writing any code:** register a softphone (Zoiper, Linphone, MicroSIP)
with those credentials and call `999` from another internal phone. If that call
connects, SIP is fine and every later problem is yours, not the PBX's. If it doesn't
connect, stop and fix it here — debugging SIP through your own code is far harder.

## Step 2 — Machine setup

Run on a machine **on the same LAN as the PBX**. This avoids NAT and STUN entirely for
now — the single biggest source of "call connects but there's no audio."

```
Python 3.11+
ffmpeg installed
Network access to the PBX on 5060/UDP and the RTP port range
```

Keys needed:

- Deepgram (STT)
- One cloud LLM (pick the fastest you have access to)
- ElevenLabs (TTS) — you already know this one, so no learning cost

Set `codec = G.711 (PCMU/PCMA)` on the extension. Clearer to debug than Opus and
fewer compatibility surprises.

## Step 3 — The script

Skeleton in `agent_skeleton.py`. It is deliberately incomplete: the structure, the
interfaces, and the ordering are decided; the SDK calls are marked `TODO` because they
move between library versions and must be taken from current docs, not from memory.

Build it in this order — **verify each before moving on:**

| # | Check | How you know it works |
|---|---|---|
| 1 | Register on 999 | 3CX console shows the extension as registered |
| 2 | Answer the call | You call 999, it stops ringing, silence on the line |
| 3 | Speak fixed text | It answers and says a hardcoded greeting |
| 4 | Hear the caller | Your words appear as text in the terminal |
| 5 | Full loop | You speak → LLM replies → you hear the reply |
| 6 | Take a message | It asks for name and reason, prints a structured result |

Step 3 is the moment the project becomes real. Steps 1–2 are plumbing; step 5 is the
product.

## Step 4 — What to measure from the first call

Log these on every call, from day one. They decide whether the product is viable:

- **Time from end of speech to first audio out** — target under 800ms
- **Where the time goes** — STT final / LLM first token / TTS first chunk
- **Interruption handling** — what happens when you talk over it
- **German accuracy** — run at least 20 real calls in Austrian German before trusting
  any STT provider. Include names and addresses; that's where it fails.

If latency is above ~1.5s, do not add features. Fix the streaming first — nothing else
matters until the call feels like a conversation.

## Step 5 — Then, and only then

Once milestone 0 works:

1. Wrap providers in the interfaces from spec §B3
2. Postgres + transcript storage (full-text index in the first migration, `user_id` on
   every table)
3. Design + build the call detail screen (spec §A6.4)
4. Everything else in spec §B11 build order

## Repo setup (do this today, takes 20 minutes)

```
opendial/
├── LICENSE          # AGPL-3.0
├── CLA.md           # before the first PR — after that it's practically impossible
├── README.md        # one-liner, what it is, what it is not, quick start
├── IDEAS.md         # everything discussed but not in v1 — parks scope safely
└── agent/
    └── agent_skeleton.py
```

`IDEAS.md` matters more than it looks. Every good idea that arrives mid-build goes
there instead of into the code. It is the mechanism that gets this finished.

## The one rule

Nothing gets built until the call in step 3 works.

Not the UI. Not the rules engine. Not the second provider. Not MCP.

The last phone integration stalled with plenty of plan and no answered call. The only
difference this time is the order.

---

## Decisions locked

These are settled. Do not reopen them without a concrete reason.

| Decision | Choice |
|---|---|
| Name | **OpenDial** — one name for everything. Hosted edition is "OpenDial Cloud". |
| Domain | `opendial.dev` |
| License | AGPL-3.0 + CLA from the first contributor |
| Copyright holder | Dpro GmbH |
| Separate from | Agent-Player and Flowxtra — own repo, own identity, no shared code without a written arrangement |
| Backend | Python (agent + FastAPI) |
| Frontend | Next.js |
| Database | PostgreSQL |
| Voice framework | LiveKit Agents |
| Packaging | Docker Compose (manual dev run also documented) |
| Runs as | Locally installed web app on the LAN — not a desktop app, not SaaS-only |
| First test bed | Existing 3CX PBX, extension 999 |
| Theme | Dark and light, dark designed first |
| Languages | Multi-language from day one: en / de / ar, RTL supported |
| Analog phone lines | Out of scope. Users bridge with an ATA; we only ever speak SIP. |
| Workflow automation | Out of scope. Webhooks + generic HTTP tool; n8n does the rest. |

---

# PART 0 — What we are building

A self-hosted service that sits between a phone line and an AI agent.

A call arrives over SIP. OpenDial checks the caller against routing rules and either
passes it through to a human, blocks it, or hands it to an AI agent. The agent speaks
with the caller in real time, can invoke tools (transfer, take a message, check a
calendar, call any HTTP endpoint), and every call is recorded, transcribed, and
searchable.

## Scope boundary — memorize this

| OpenDial owns | OpenDial does NOT own |
|---|---|
| Telephony / SIP | General workflow automation |
| Voice pipeline (STT → LLM → TTS) | Integrations with 400 SaaS apps |
| Turn-taking, barge-in | Being a CRM |
| Conversation + memory | Being a PBX replacement |
| Call routing rules | Analog hardware support |
| Transcript archive + search | |
| Tool execution | |

Everything outside the left column is reached through **webhooks** and the **generic
HTTP tool**. n8n and Home Assistant do that job better than we would.

## Users

1. **Primary — self-hosters and developers.** Run Docker, edit config, bring their own
   API keys. They found us on GitHub or Hacker News.
2. **Secondary — small businesses** (clinics, workshops, agencies) who buy the hosted
   edition. They must never see a config file.

The UI serves both: working defaults for group 2, an **Advanced** surface for group 1.

## Why this exists

Well-funded closed products already do "AI receptionist for business." What does not
exist is a good **open, self-hosted** one where the user owns the recordings, picks the
models, and decides which callers ever reach the AI at all.

---

# PART A — DESIGN SPECIFICATION

## A1. Design principles

1. **The transcript is the product surface.** Most time in this app is spent reading
   what was said. Optimize for reading comfort above all else.
2. **State must be unmistakable.** Is the system live? Is a call happening right now?
   Did the agent handle it or did a human? Never make the user hunt for this.
3. **Defaults over configuration.** Every field that can have a working default has one.
   Empty inputs make users hesitate.
4. **Advanced is hidden, not absent.** Developers will find it. Everyone else won't
   trip over it.
5. **Nothing depends on string length.** Multi-language from day one (see A4).

## A2. Theme

Dark and light, toggled in the top bar, persisted per user.

**Design dark first.** The primary audience runs self-hosted tools and prefers dark.
Light must be a real second pass, not an inverted dark theme.

## A3. Visual system

**Type**

- UI: clean geometric sans (Inter or similar)
- Monospace for: phone numbers, timestamps, API keys, logs, IDs
- Transcript body: comfortable reading size, generous line height — people read these
  for minutes at a time

**Color**

- One accent, used sparingly: primary actions and live state only
- Semantic set:
  - green — passed through to human
  - red — blocked
  - accent — AI handled
  - amber — needs attention
- **Live call indicator must pulse.** Not a subtle badge.

**Density**

Medium. Denser than a consumer app, lighter than a monitoring dashboard.
Tables scan fast; detail views breathe.

**Elevation**

Flat with clear borders. Avoid heavy shadows — they read poorly in dark mode.

## A4. Internationalization

Multi-language is infrastructure, not content work.

- Language chosen at first-run setup, changeable in **Settings → General**
- All UI strings in locale files. Launch with `en`, `de`, `ar`. More via community PRs.
- **German runs ~30% longer than English.** No fixed-width buttons or labels. Every
  layout must survive 1.4x string expansion without breaking.
- **Arabic requires full RTL.** Mirrored layout, mirrored directional icons (arrows,
  chevrons). But Latin-script data stays LTR: phone numbers, API keys, timestamps,
  logs, code.
- Dates, times, and number formats follow the selected locale.

## A5. Required states

Every screen must be designed in all five:

| State | Requirement |
|---|---|
| Empty | First-run has zero calls. This screen must teach without a manual and offer one clear next action. |
| Loading | Skeletons, not spinners, for lists and detail views. |
| Error | Say what broke and what to do. Never a bare error code. |
| Success | Confirm the action happened; don't leave the user guessing. |
| Offline | The system lost SIP registration or a provider. This must be loud. |

Empty states matter most here — a fresh install is entirely empty.

## A6. Screens

### A6.1 Onboarding — three steps, once

**Step 1 — Connect a number**

Two clearly separated paths, side by side. Do not bury either:

- **Buy a number** — pick country → available numbers with live pricing from the
  provider API → buy
- **I already have SIP** — host, port, username, password, register (3CX, Asterisk,
  FreePBX). This is how most of the early audience will start.

**Step 2 — Providers**

Three blocks: STT, LLM, TTS. Each has: provider dropdown, API key field, and a
**"Test connection"** button that must return a real result before the user continues.
Show approximate cost per minute.

Offer a **"Use local models"** path (Ollama + Whisper + Piper), clearly labeled as
requiring a GPU. Do not make it the default — a first experience on a CPU-only machine
is a choppy call and a lost user.

**Step 3 — Your agent**

Name, language, voice (with preview playback), and a personality prompt that is
**already filled with a working default**. Never show an empty prompt box.

**Finish — "Call yourself now"**

One large button. This is the single most important element in the product. It is the
moment the user hears the thing work and decides whether to stay. Design it as the
payoff of the entire flow — full width, unmissable.

### A6.2 Home

Top bar: system status (connected / degraded / offline) · calls today · master on-off.

Body, in this priority order:

1. **Needs your attention** — callbacks requested, calls the agent couldn't handle,
   failed tool calls, provider errors. When empty, say so warmly. Never a bare box.
2. **Recent calls** — compact rows, click to open.
3. **Dial card** — small, in a side column. For test and outbound calls. Deliberately
   minor: the user is not a switchboard operator; the agent does the work.

### A6.3 Calls — list

Columns: caller (contact name when known, number below) · time · duration · handling
badge (passed / blocked / AI) · one-line summary.

Filters: date range · handling type · has recording · detected intent.

**Full-text search across all transcripts is the headline feature of this screen.**
Typing "prescription" surfaces every call where it was said. Give the search field real
prominence — not a small icon in a corner. This is the feature that makes people stay.

### A6.4 Call detail — **design this screen first**

This is the heart of the product. It defines the whole design system.

Layout:

- **Header** — caller, contact link, date, duration, how it was handled, detected intent
- **Audio player** — waveform, scrubbable, synced to the transcript (clicking a line
  jumps the audio)
- **Transcript** — speaker labels and timestamps, with clear markers for human takeover:

```
00:03   Caller     I have an appointment Tuesday, can I move it?
00:07   Agent      Of course. What day works for you?
00:14   ──── human joined: Mohamed ────
00:16   Mohamed    Thursday at ten
00:22   ──── agent resumed ────
00:24   Agent      Booked — Thursday at 10:00. Anything else?
```

- **Whisper channel** — operator instructions the caller never heard. Shown in a
  visually separate side channel. **Never inline** with what the caller actually heard.
- **Right rail** — summary, detected intent, and the list of tools the agent actually
  invoked (with result status)

### A6.5 Rules

Three visual columns: **Always through** · **Blocked** · **AI handles**.

- Add a number in one action
- Drag between columns
- Each entry shows when that number last called and how it was handled — rule and
  consequence in one view

Also on this screen: **business hours** (outside them the agent always answers) and
**failover behavior** if a provider fails mid-call.

### A6.6 Agent

- Persona prompt (with the working default pre-filled)
- Language, voice, speaking speed
- **Knowledge sources** — uploaded text or files the agent can search
- **Tools** — each a card with a toggle, a plain-language description of *when* the
  agent will use it, and its config. Show a visible warning when many tools are on:
  every extra tool raises the chance the agent uses one at the wrong moment.
- **"Try it" panel** — a text chat against the same agent, no phone call needed. This
  is the prompt-tuning loop. Make it fast and always reachable.

### A6.7 Live call

Appears whenever a call is active, reachable from anywhere in the app.

- Live transcript, streaming word by word
- Caller info, matched contact, previous interactions
- Three intervention actions, **large and unambiguous** — this screen is used under
  time pressure, mid-conversation:
  - **Whisper** — type an instruction; the agent speaks it in its own voice; the caller
    never knows. *Highest value, lowest complexity. Build first.*
  - **Take over** — agent goes silent. Operator speaks by mic, **or types and the agent
    voices it** (important for users who don't want to speak).
  - **Hand off** — transfer to a real phone and exit.

### A6.8 Settings — one screen, seven tabs

1. **General** — interface language, theme, timezone, agent display name
2. **Providers** — STT / LLM / TTS: provider, key, "Test connection", est. cost/min
3. **Numbers** — connected numbers, buy new, per-number agent assignment, status
4. **Routing** — forwarding target, business hours, failover
5. **Integrations** — webhooks in/out (with "Send test"), n8n URL, notification channel
   (Telegram / email), MCP endpoint + token
6. **Privacy & recording** — recording on/off, retention period, **automatic recording
   announcement (ON by default — legally required in Austria, and it must cover human
   takeover too, not only the agent)**, data export, data deletion
7. **System** — version, updates, logs, config export/import, reset

### A6.9 Standalone pages

- **Contacts** — known callers, tags, per-contact history across all channels. Feeds
  agent memory. Shows calls and (later) chats in one timeline.
- **Logs** — technical log stream for debugging. Monospace, filterable, copyable.

## A7. Design deliverable

**Design A6.4 (Call detail) first, alone.**

It is the heart of the product and it will settle color, type, density, card style, and
how speaker labels and intervention markers read. Once it's right, the rest follow
quickly.

Do not design all screens up front.

---

# PART B — TECHNICAL SPECIFICATION

## B1. Stack

| Layer | Choice | Why |
|---|---|---|
| Voice agent | **Python** | `livekit-agents`, and every STT/LLM/TTS SDK ships Python first |
| API | **Python + FastAPI** | Same runtime as the agent; auto-generated OpenAPI docs |
| Frontend | **Next.js + React** | Known stack; SSR not required but harmless |
| Database | **PostgreSQL** | Transcripts need real full-text search; Postgres gives it natively |
| Cache / queue | **Redis** | Session state, rate limiting |
| Reverse proxy | **Caddy** | Automatic Let's Encrypt; also solves the mic-over-HTTPS problem |
| Packaging | **Docker Compose** | Multiple services + heavy audio dependencies |

**Voice pipeline: build on LiveKit Agents (Apache 2.0).** It provides SIP integration,
turn-taking, barge-in, and session management out of the box. Do not rebuild these.
Our value is in routing, rules, archive, and tools — not in reinventing the audio path.

## B2. Repository layout

```
opendial/
├── agent/                  # Python — SIP, voice pipeline, agent loop, tools
│   ├── providers/          # stt/, llm/, tts/ — one interface, many implementations
│   ├── tools/              # built-in tool implementations
│   ├── routing/            # whitelist / blacklist / hours logic
│   └── session/            # call lifecycle, turn-taking, whisper handling
├── api/                    # Python FastAPI — REST + WebSocket
├── web/                    # Next.js dashboard
├── locales/                # en / de / ar
├── examples/
│   └── workflows/          # importable n8n JSON examples
├── docker-compose.yml
├── docker-compose.dev.yml
├── CLA.md
├── LICENSE                 # AGPL-3.0
├── IDEAS.md                # parking lot — keeps scope out of v1
└── README.md
```

## B3. Provider interfaces

Every provider sits behind one interface. **Implement exactly one of each for v1** —
the abstraction is written on day one, the second implementation comes after the first
call works.

```
STTProvider   → stream(audio) -> partial/final transcripts
LLMProvider   → stream(messages, tools) -> token stream + tool calls
TTSProvider   → stream(text) -> audio chunks
              → cancel()        # MUST exist: on barge-in, stop instantly
```

`cancel()` is not optional. When the caller interrupts, audio must stop immediately and
the queued speech is discarded. Without it the agent talks over people and the product
feels broken.

**v1 implementations:** Deepgram (STT) · one cloud LLM (fastest available) ·
ElevenLabs (TTS).

**v1.1:** Ollama, Whisper local, Piper, Cartesia — many will arrive as community PRs.

## B4. Latency budget — the hard requirement

Target **under 800ms** from end of caller speech to first audio out.

| Stage | Budget |
|---|---|
| STT final | ~150ms |
| LLM first token | ~300ms |
| TTS first chunk | ~100ms |
| Network / buffer | ~250ms |

**Everything streams.** The first sentence starts speaking while the rest is still being
generated. Never wait for a complete LLM response before starting TTS. This single
decision is the difference between a natural call and an obviously robotic one.

**Tool latency must be covered by speech.** If a tool takes 3 seconds, the agent says
"one moment, let me check the calendar" and runs the call in parallel. Silence reads as
a dropped call.

## B5. Data model (core tables)

```
users            id, email, password_hash, locale, theme, created_at
numbers          id, user_id, provider, e164, sip_config, agent_id, status
agents           id, user_id, name, persona_prompt, language, voice_id, settings
contacts         id, user_id, e164, name, tags, notes
rules            id, user_id, e164_or_pattern, action(pass|block|ai), note
calls            id, user_id, number_id, contact_id, direction, from_e164,
                 started_at, ended_at, handling, intent, summary, recording_path
transcript_lines id, call_id, ts_ms, speaker(caller|agent|human), text, is_whisper
tool_invocations id, call_id, tool_name, args, result, status, latency_ms
knowledge        id, user_id, agent_id, title, content, embedding
webhooks         id, user_id, url, events[], secret
```

**Two decisions that are painful to add later — make them now:**

1. **`user_id` on every table from day one**, even while it is always `1`. Adding
   multi-tenancy to a live database later is real pain, and the hosted edition needs it.
2. **Full-text index on `transcript_lines.text`** from the first migration.

## B6. API surface

REST, documented automatically by FastAPI. The dashboard consumes this same API —
so it exists anyway; just make it public and documented.

```
GET    /health                     # deep check: SIP reg, providers, DB
GET    /api/calls                  # list + filter
GET    /api/calls/{id}             # detail + transcript
GET    /api/calls/search?q=        # full-text across transcripts
POST   /api/calls/outbound         # {to, prompt} — start an outbound call
GET    /api/rules  POST  /api/rules
GET    /api/agents PATCH /api/agents/{id}
GET    /api/contacts
GET    /api/settings PATCH /api/settings
POST   /api/providers/test         # test connection
WS     /ws/calls/{id}              # live transcript stream
WS     /ws/calls/{id}/whisper      # operator → agent, mid-call
```

**Webhooks out:** `call.started` · `call.ended` · `intent.detected` ·
`message.taken` · `tool.failed` · `system.degraded`

Each signed with a shared secret.

**Webhook in:** `POST /hooks/call` — start an outbound call from n8n or anything else.

## B7. Built-in tools

Keep this list short. Five precise tools beat twenty that confuse the model.

| Tool | Purpose |
|---|---|
| `transfer_call` | Hand to a human |
| `take_message` | Structured message capture |
| `end_call` | Polite close |
| `send_notification` | Telegram / email |
| `http_request` | Generic escape hatch — covers everything else |
| `search_knowledge` | Search user-uploaded content. **Will be the most used tool.** |
| `check_calendar` | Google Calendar + CalDAV (covers Nextcloud, iCloud) |

**Calendar rule:** the agent **proposes and confirms**, or writes to a review calendar.
It does not book directly into a live calendar in v1. One wrong entry destroys trust
permanently.

## B8. Health and monitoring

Not a feature — a requirement. A silently dead phone service is worse than an obviously
dead one, because the user only finds out after losing ten calls.

- `/health` checks **actual** state: SIP registration, provider reachability, DB
- Alert immediately (Telegram / email) on lost SIP registration
- Clear status indicator in the dashboard top bar
- Per-call telemetry: latency per stage, tool timings, interruption count

## B9. Security

- **Password required on first run.** Not optional, no default credentials.
- **Encrypt API keys at rest.** Never return them in full to the client after saving.
- **Do not expose the port to the internet by default.** Document VPN / Tailscale /
  reverse-proxy-with-HTTPS as the supported paths.
- **Browsers block microphone access over plain HTTP outside `localhost`.** Voice
  takeover therefore requires HTTPS. Caddy solves this; until then, ship whisper and
  type-to-speak only.
- **MCP endpoint needs its own token**, separate from the dashboard session, plus hard
  limits (calls per hour, allowed destination numbers). An external model that can
  start real calls spends real money.
- **Recording announcement on by default.** Austria requires both parties to be aware,
  and the requirement rises once a human joins.

## B10. Deployment

```bash
docker compose up -d          # everything
docker compose --profile automation up -d   # + bundled n8n (optional)
```

- Also document **manual dev run** (`pip install` + `npm run dev`). Contributors need
  to run code without rebuilding an image on every edit.
- **Never assume Docker in code.** All config from environment variables.
- Settings export/import so a user can test locally and move to a server with one file.
- On a server: HTTPS via Caddy, and open a UDP range for RTP (e.g. 10000–20000) with
  `external_ip` configured. Most "call connects but no audio" reports trace to this —
  document it prominently.

## B11. Build order

Do not start step N+1 before step N works.

| # | Milestone | Done when |
|---|---|---|
| 0 | **First call** | A 3CX extension (e.g. 999) rings, a Python script answers, speaks via TTS, takes a message, prints a transcript. **No UI, no Docker, no database.** |
| 1 | Provider interfaces | One STT/LLM/TTS each behind clean interfaces |
| 2 | Persistence | Postgres, calls + transcripts stored |
| 3 | Routing rules | Whitelist / blacklist / AI from SIP caller ID |
| 4 | Web UI | Call detail → calls list → home → rules → agent → settings |
| 5 | Webhooks + REST | Documented, signed |
| 6 | Tools | The seven in B7 |
| 7 | Live intervention | Whisper first, takeover after |
| 8 | Health + alerts | B8 complete |
| 9 | Docker packaging | One-command install |
| 10 | MCP server | Thin layer over the REST API, with hard limits |

**Milestone 0 is the only one that matters right now.** If it works within two weeks,
everything above is worth building. If it doesn't, that is valuable information gained
cheaply.

## B12. Licensing and ownership

- **AGPL-3.0.** Anyone running it as a network service must publish their modifications.
  This is what makes a future commercial license sellable.
- **CLA required from the first contributor.** A simple agreement, signed electronically
  via a GitHub bot, granting relicensing rights. **Add it before the first PR** — after
  that it becomes practically impossible, and without it the commercial license option
  is gone forever.
- **Copyright held by Dpro GmbH.** Any code shared with other projects needs a written
  license arrangement between the entities — cheap now, expensive later.
- Three revenue paths, one codebase: **hosted edition** · **commercial license for
  closed-source integration** · **support**. The free version is never crippled; it is
  the product.

*Not legal advice — confirm the trademark position on "OpenDial" (EUIPO classes 9 and
42) before committing to a logo. An older academic dialogue-systems framework shares
the name.*

### B12.1 What AGPL does and does not do

AGPL cannot restrict what users do with the software. An open license means full
freedom of use. The only enforceable obligation is AGPL's own: modify it and run it as
a network service, and you must publish your modifications.

*Commercial and ownership strategy is maintained privately and is not part of this
specification.*

---

# PART C — Notes for whoever builds this

- The demo is easy. A pipeline of STT → LLM → TTS over SIP can be running in two days.
  The product is hard, and the distance between the two is turn-taking, latency, and
  reliability. Budget accordingly.
- Test every provider **in German** before adopting it. Quality drops noticeably outside
  English, and Austrian pronunciation of names and addresses is where most STT fails.
- 8kHz phone audio is not studio audio. Test with real calls from real phones early.
- Distribution matters as much as code: a strong README, a 30-second video of a real
  call, and launches on Hacker News and r/selfhosted. An excellent project nobody finds
  is a dead project.
- An **n8n community node** for OpenDial is one of the strongest distribution channels
  available — a large community actively looking for new nodes.
- Everything discussed but not in this document belongs in `IDEAS.md`. It will still be
  there when it's needed, and it won't distract now.
