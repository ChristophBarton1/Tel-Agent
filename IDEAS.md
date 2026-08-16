# IDEAS.md — the parking lot

Everything discussed but not in v1 goes here.

This file matters more than it looks. Every good idea that arrives mid-build gets
written down here **instead of into the code**. It is the mechanism that gets this
project finished. The ideas will still be here when they are needed, and they will
not distract now.

**The one rule:** nothing gets built until the first call works.
Not the UI. Not the rules engine. Not the second provider. Not MCP.

---

## How to add an entry

Append to the right section with a one-line description and, where it matters, the
reason it is deferred. No estimates, no priorities — this is a list, not a roadmap.
Items graduate out of this file only when an earlier milestone is finished.

---

## Deferred from the specification

These are already described in `docs/SPEC.md` and scheduled, just not now.

- **Provider abstraction** (§B3) — Milestone 1. One implementation each of STT / LLM /
  TTS first; the second implementation comes only after the first call works.
- **Additional providers** (§B3) — Ollama, local Whisper, Piper, Cartesia. Many will
  arrive as community pull requests.
- **PostgreSQL persistence** (§B5) — Milestone 2.
- **Routing rules engine** (§A6.5, §B11) — Milestone 3.
- **Web dashboard** (§A6) — Milestone 4, starting with the call detail screen.
- **Webhooks and public REST API** (§B6) — Milestone 5.
- **Built-in tools** (§B7) — Milestone 6.
- **Live intervention: whisper, then takeover** (§A6.7) — Milestone 7. Whisper first:
  highest value, lowest complexity.
- **Health checks and alerting** (§B8) — Milestone 8.
- **Docker packaging** (§B10) — Milestone 9.
- **MCP server** (§B11) — Milestone 10. A thin layer over the REST API, with hard
  limits: an external model that can start real calls spends real money.
- **Buying phone numbers in-app** (§A6.1) — the early audience connects an existing
  SIP extension; number purchasing comes later.
- **Knowledge sources and embeddings** (§A6.6, §B5) — `search_knowledge` is expected
  to become the most used tool, but not before the call works.
- **Contacts and per-caller history** (§A6.9).
- **Arabic RTL layout** (§A4) — the locale files exist from day one; the mirrored
  layout work lands with the UI.

---

## Distribution

- **n8n community node for OpenDial** — one of the strongest distribution channels
  available; a large community actively looks for new nodes.
- **A 30-second video of a real call** — carries more weight than any README section.
- **Launches on Hacker News and r/selfhosted** — an excellent project nobody finds is
  a dead project.
- **Importable n8n workflow examples** under `examples/workflows/`.

---

## Open questions

- **Trademark position on "OpenDial"** (EUIPO classes 9 and 42). An older academic
  dialogue-systems framework shares the name. Confirm before committing to a logo.
  *Not legal advice.*
- **How SIP is handled in Milestone 0** — LiveKit self-hosted, LiveKit Cloud, or
  direct SIP via pjsua2/baresip. See the open question in `CLAUDE.md`. Not deferred:
  this one blocks Milestone 0 and needs an answer.

---

## Ideas raised during the build

*(Add new entries below. Date them.)*
