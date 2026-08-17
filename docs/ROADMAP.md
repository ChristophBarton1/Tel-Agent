# Roadmap

Twelve milestones. **Step N+1 does not start before step N works.**

This is the public, milestone-level view. Day-to-day tasks live in
[GitHub Issues](https://github.com/Dpro-at/OpenDial/issues); ideas that are not in v1
live in [`IDEAS.md`](../IDEAS.md).

---

## Where the project is now

**Milestone 0. Nothing else is being worked on.**

That is not a formality. The previous attempt at this stalled with plenty of plan and
no answered call. The order is the only thing being changed this time.

> **Nothing gets built until the first call works.**
> Not the UI. Not the rules engine. Not the second provider. Not MCP.

Milestone 0 has a **two-week time box**. If it is not working by then, the constraint
is time rather than architecture — and learning that early is worth more than any
feature.

---

## 0 — First call · **in progress**

A phone number rings, a Python script answers, speaks, listens, replies, takes a
message, and prints a transcript.

The number comes from a SIP provider and is pointed at the agent. An extension on an
existing PBX reaches the same place and stays a first-class way to connect a line — it
is simply not the path that proves the product first, because it depends on access to
a PBX that the person building this may not administer.

**No UI. No Docker. No database. No routing rules. No provider abstraction.**
One script in a terminal.

Six checks, in order:

| # | Check | Done when |
|---|---|---|
| 1 | Arrive | The provider console shows the inbound call reaching our SIP endpoint |
| 2 | Answer | You call it, it stops ringing, the line goes quiet |
| 3 | Speak | It answers with a hardcoded greeting |
| 4 | Listen | Your words appear as text in the terminal |
| 5 | **Full loop** | You speak → the model replies → you hear the reply |
| 6 | Take a message | It asks for name and reason, prints a structured result |

Steps 1–2 are plumbing. **Step 5 is the product.**

Before any code: buy the number, point it at the SIP endpoint, call it from a mobile,
and confirm in the provider console that the call arrives. If it does not, the problem
is in the number configuration, and debugging SIP through our own code is far harder.

**Measured from the first call:** time from end of speech to first audio out (target
under 800 ms), where that time goes — **endpointing included, as it is usually the
largest stage** — what happens when the caller interrupts, and accuracy across at
least 20 real calls in Austrian German including names and addresses. **If latency
exceeds ~1.5 s, no features are added until streaming is fixed.**

**Also recorded on the first forwarded call:** which number arrives in the caller ID
when a call is forwarded rather than dialled directly — the original caller's, or the
subscriber's. This is carrier-dependent and it decides whether Milestone 3 works at
all.

## 1 — Provider interfaces

One speech-to-text, one language model and one text-to-speech implementation, each
behind a clean interface. `cancel()` on text-to-speech is mandatory: on interruption,
audio stops instantly and queued speech is discarded.

The second implementation of anything comes after this, never before.

## 2 — Persistence

PostgreSQL. Calls and transcripts stored.

Two things that are painful to add later and are therefore done here: `user_id` on
every table even while it is always `1`, and a full-text index on transcript text in
the first migration.

## 3 — Routing rules

Pass through, block, or hand to the AI, decided from the caller ID. Business hours.

This milestone rests on an assumption worth testing in Milestone 0 rather than here:
that a forwarded call still carries the original caller's number. Some carriers
present the forwarding subscriber's number instead, which would leave every rule
matching the same number on every call. Where the original survives in a diversion
header, read it from there.

## 4 — Web UI

In this order: **call detail** → calls list → home → rules → agent → settings.

Call detail is designed and built first, alone. It is the heart of the product and it
settles the vocabulary every other screen inherits. Onboarding is designed last,
because it should be assembled from components the rest of the product already proved.

## 5 — Webhooks and REST

The documented, signed public API. The dashboard already consumes it, so it exists
anyway — this milestone makes it public and documented.

## 6 — Tools

Transfer, take a message, end call, notify, generic HTTP request, search knowledge,
check calendar.

Kept short on purpose: five precise tools beat twenty that confuse the model. The
calendar tool proposes and confirms, or writes to a review calendar — it does not book
directly into a live calendar in v1. One wrong entry destroys trust permanently.

## 7 — Live intervention

**Whisper first** — the operator types an instruction, the agent speaks it in its own
voice, the caller never knows. Highest value, lowest complexity.

Takeover follows. Note that browsers block microphone access over plain HTTP outside
`localhost`, so voice takeover needs HTTPS; until then, whisper and type-to-speak only.

## 8 — Health and alerts

Not a feature. A silently dead phone service is worse than an obviously dead one,
because the operator only finds out after losing ten calls.

Real checks on SIP registration, provider reachability and the database; immediate
alerting on lost registration; per-call latency telemetry.

## 9 — Docker packaging

One-command install. Manual development runs stay documented — contributors need to
run the code without rebuilding an image on every edit.

## 10 — MCP server

A thin layer over the REST API, with hard limits. An external model that can start
real calls spends real money.

## 11 — Messaging channels

WhatsApp, Telegram, Discord, Messenger and Instagram. The same agent, the same tools,
the same searchable archive — a different transport. **The list is closed at five plus
the phone.**

The customer connects credentials from their own developer account on each platform.
OpenDial never holds a shared platform application: one shared app would put every
installation behind a single rate limit and make one policy violation everybody's
outage.

**This is last on purpose.** The phone is the hard case — no interface, no way to show
the caller what was understood, a sub-second latency budget, and a caller who
interrupts mid-sentence. Text channels are forgiving, and an architecture built to
satisfy them would look healthy while being far too slow for voice. Build for the
phone, then fit the rest to it.

Setup requirements per channel are specified in `docs/SPEC.md` §B13.

---

## Not on this roadmap

| | Why |
|---|---|
| General workflow automation | Webhooks and a generic HTTP tool reach n8n and Home Assistant, which do it better |
| Integrations with SaaS applications | A **channel** is where the conversation happens; an **integration** is a system the agent acts on. We own the first and reach the second through the HTTP tool. Channels are a closed list of six; integrations are unbounded, which is why they are somebody else's product |
| Being a CRM | Not what this is |
| Being a PBX replacement | It connects to your PBX as an extension |
| Analog hardware support | We only ever speak SIP. A genuinely analog line is bridged with an ATA — see the requirements in the README |

Everything discussed but not scheduled is in [`IDEAS.md`](../IDEAS.md). That file is
the mechanism that gets this project finished: ideas go there instead of into the code.
