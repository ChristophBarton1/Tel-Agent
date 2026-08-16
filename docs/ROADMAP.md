# Roadmap

Eleven milestones. **Step N+1 does not start before step N works.**

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

A phone extension rings, a Python script answers, speaks, listens, replies, takes a
message, and prints a transcript.

**No UI. No Docker. No database. No routing rules. No provider abstraction.**
One script in a terminal.

Six checks, in order:

| # | Check | Done when |
|---|---|---|
| 1 | Register | The PBX console shows the extension as registered |
| 2 | Answer | You call it, it stops ringing, the line goes quiet |
| 3 | Speak | It answers with a hardcoded greeting |
| 4 | Listen | Your words appear as text in the terminal |
| 5 | **Full loop** | You speak → the model replies → you hear the reply |
| 6 | Take a message | It asks for name and reason, prints a structured result |

Steps 1–2 are plumbing. **Step 5 is the product.**

Before any code: a softphone registered with the same credentials must be able to call
the extension. If that fails, the problem is in the PBX, and debugging SIP through our
own code is far harder.

**Measured from the first call:** time from end of speech to first audio out (target
under 800 ms), where that time goes, what happens when the caller interrupts, and
accuracy across at least 20 real calls in Austrian German including names and
addresses. **If latency exceeds ~1.5 s, no features are added until streaming is
fixed.**

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

---

## Not on this roadmap

| | Why |
|---|---|
| General workflow automation | Webhooks and a generic HTTP tool reach n8n and Home Assistant, which do it better |
| Integrations with SaaS applications | Same |
| Being a CRM | Not what this is |
| Being a PBX replacement | It connects to your PBX as an extension |
| Analog hardware support | We only ever speak SIP. A genuinely analog line is bridged with an ATA — see the requirements in the README |

Everything discussed but not scheduled is in [`IDEAS.md`](../IDEAS.md). That file is
the mechanism that gets this project finished: ideas go there instead of into the code.
