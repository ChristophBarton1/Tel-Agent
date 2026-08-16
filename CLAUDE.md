# CLAUDE.md — working rules for OpenDial

Guidance for Claude Code (and any AI assistant) working in this repository.
Read this before touching anything.

---

## Rule 0 — Everything in the repository is English

**All code, comments, docstrings, identifiers, commit messages, and documentation
are written in English.** No exceptions, regardless of the language used in
conversation.

The maintainer communicates in Arabic; the codebase does not. OpenDial is a
public AGPL-3.0 project aimed at an international contributor base, and an
Arabic codebase would close the door on outside contributions.

User-facing *interface strings* are a separate matter: those live in
`locales/` and are translated to `en` / `de` / `ar` (see §A4 of the spec).

---

## Rule 1 — Nothing gets built until the first call works

Milestone 0 is the only milestone that exists right now:

> A 3CX extension (999) rings, a Python script answers, speaks via TTS,
> hears the caller via STT, replies via an LLM, takes a message, and prints
> a transcript. **No UI. No Docker. No database. No routing rules.**

Not the UI. Not the rules engine. Not the second provider. Not MCP.
Not the provider abstraction — that is Milestone 1.

The previous phone integration stalled with plenty of plan and no answered
call. The only thing being changed this time is the order.

**Time box: two weeks.** If it is not working by then, the constraint is time,
not architecture, and knowing that early is worth more than any feature.

If asked to build something outside Milestone 0, say so and put it in
`IDEAS.md` instead.

---

## Rule 2 — Verify each step before moving to the next

Build order inside Milestone 0. Do not start step N+1 before step N works:

| # | Check | How you know it works |
|---|---|---|
| 1 | Register on 999 | The 3CX console shows the extension as registered |
| 2 | Answer the call | You call 999, it stops ringing, silence on the line |
| 3 | Speak fixed text | It answers and says a hardcoded greeting |
| 4 | Hear the caller | Your words appear as text in the terminal |
| 5 | Full loop | You speak → LLM replies → you hear the reply |
| 6 | Take a message | It asks for name and reason, prints a structured result |

Steps 1–2 are plumbing. Step 5 is the product.

**Before any code at all:** a softphone (Zoiper, Linphone, MicroSIP) registered
with the same credentials must be able to call 999 from another internal phone.
If that fails, the problem is in the PBX and no amount of Python will fix it.

---

## Rule 3 — Everything streams

Target: **under 800 ms** from end of caller speech to first audio out.

| Stage | Budget |
|---|---|
| STT final | ~150 ms |
| LLM first token | ~300 ms |
| TTS first chunk | ~100 ms |
| Network / buffer | ~250 ms |

The first sentence starts speaking while the rest is still being generated.
**Never wait for a complete LLM response before starting TTS.** This one
decision is the difference between a natural call and an obviously robotic one.

`cancel()` on the TTS provider is not optional. When the caller interrupts,
audio stops immediately and queued speech is discarded. Without it the agent
talks over people and the product feels broken.

Tool latency must be covered by speech: if a tool takes 3 seconds, the agent
says "one moment, let me check the calendar" and runs the call in parallel.
Silence reads as a dropped call.

**If latency is above ~1.5 s, do not add features.** Fix the streaming first.

---

## Rule 4 — Measure from the first call

Log these on every call, starting with the very first one:

- Time from end of speech to first audio out
- Where the time goes: STT final / LLM first token / TTS first chunk
- Interruption handling — what happens when the caller talks over the agent
- German accuracy — at least 20 real calls in Austrian German before trusting
  any STT provider, including names and addresses, which is where it fails

---

## Rule 5 — Scope discipline

Every good idea that arrives mid-build goes into `IDEAS.md`, not into the code.
That file is the mechanism that gets this project finished.

| OpenDial owns | OpenDial does NOT own |
|---|---|
| Telephony / SIP | General workflow automation |
| Voice pipeline (STT → LLM → TTS) | Integrations with 400 SaaS apps |
| Turn-taking, barge-in | Being a CRM |
| Conversation + memory | Being a PBX replacement |
| Call routing rules | Analog hardware support |
| Transcript archive + search | |
| Tool execution | |

Anything outside the left column is reached through webhooks and the generic
HTTP tool. n8n and Home Assistant do that job better than we would.

---

## Locked decisions

Settled. Do not reopen without a concrete reason.

| Decision | Choice |
|---|---|
| Name | **OpenDial** — hosted edition is "OpenDial Cloud" |
| Domain | `opendial.dev` |
| License | AGPL-3.0 + CLA from the first contributor |
| Copyright holder | Dpro GmbH (Vienna) |
| Separate from | Agent-Player and Flowxtra — own repo, no shared code without a written arrangement |
| Backend | Python (agent + FastAPI) |
| Frontend | Next.js |
| Database | PostgreSQL |
| Voice framework | LiveKit Agents |
| Packaging | Docker Compose (manual dev run also documented) |
| Runs as | Locally installed web app on the LAN — not a desktop app, not SaaS-only |
| First test bed | Existing 3CX PBX, extension 999 |
| Theme | Dark and light, dark designed first |
| Languages | en / de / ar from day one, RTL supported |
| Analog lines | Out of scope — users bridge with an ATA; we only ever speak SIP |
| Workflow automation | Out of scope — webhooks + generic HTTP tool; n8n does the rest |

---

## Open question, not yet decided

**How SIP is handled in Milestone 0.** The specification names LiveKit Agents
as the voice framework, but LiveKit SIP requires a LiveKit server plus the SIP
service — which in practice means containers, and Milestone 0 explicitly rules
out Docker. Options:

- **(a)** Direct SIP via `pjsua2` / `baresip` / `pyVoIP` — genuinely one script,
  but turn-taking and barge-in are written by hand and later thrown away
- **(b)** LiveKit self-hosted locally — commits to the framework from day one and
  gets turn-taking and barge-in for free, at the cost of running two services
- **(c)** LiveKit Cloud — fastest path to a working call, but media leaves the
  LAN, which defeats the "same LAN, no NAT" property Milestone 0 relies on

Do not pick one unilaterally. Ask the maintainer.

---

## Code conventions

**Python**
- Python 3.11+ (3.12 on the current dev machine)
- Type hints on every public function
- `async`/`await` throughout the audio path — no blocking calls on the media thread
- Formatting: `ruff format`; linting: `ruff check`
- Configuration comes from environment variables only. Never assume Docker.

**Secrets**
- API keys and SIP credentials live in `.env`, which is gitignored
- Never log a key, never commit one, never return one in full to a client
- `.env.example` documents every variable with a safe placeholder

**Call data**
- Recordings and transcripts are personal data under GDPR
- They stay on the machine that produced them and are gitignored
- The recording announcement defaults to on — Austria requires both parties to
  be aware, and the requirement still applies once a human joins the call

**Data model** — two decisions that are painful to add later, so they are made now:
1. `user_id` on every table from day one, even while it is always `1`
2. A full-text index on `transcript_lines.text` in the first migration

**Git**
- Commit messages in English, imperative mood
- The CLA must be in place before the first external PR is merged; after that
  it becomes practically impossible to obtain retroactively

---

## Where things are

| Path | Contents |
|---|---|
| `docs/SPEC.md` | The complete build specification — single source of truth |
| `docs/DESIGN_BRIEF.md` | Design starting point; the call detail screen comes first |
| `IDEAS.md` | Parking lot for everything not in v1 |
| `CLA.md` | Contributor License Agreement |
| `.env.example` | Every environment variable, documented |
| `internal/` | **Gitignored, never published.** Progress tracking, decision log, PBX runbook, commercial strategy. Read `internal/README.md` before putting anything there — and never a credential. |

When `docs/SPEC.md` and this file disagree, the specification wins — and this
file should be corrected.
