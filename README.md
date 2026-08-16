<div align="center">

# OpenDial

**Connect any phone line to any AI model. Self-hosted, bring your own keys.**

[![License: AGPL v3](https://img.shields.io/badge/License-AGPL_v3-blue.svg)](LICENSE)
[![Status: pre-alpha](https://img.shields.io/badge/status-pre--alpha-orange.svg)](#project-status)

[opendial.dev](https://opendial.dev) · maintained by [Dpro GmbH](https://dpro.at), Vienna

</div>

---

## What it is

OpenDial is an open-source gateway that sits between a phone line and an AI agent.

A call arrives over SIP. OpenDial checks the caller against your routing rules and
either passes it through to a human, blocks it, or hands it to an AI agent. The agent
speaks with the caller in real time, can invoke tools — transfer the call, take a
message, check a calendar, call any HTTP endpoint — and every call is recorded,
transcribed, and searchable.

It runs on your own hardware, on your own LAN, with your own API keys.

## What it is not

- **Not a PBX replacement.** It connects to your existing PBX (3CX, Asterisk, FreePBX)
  as an extension.
- **Not a workflow automation platform.** Webhooks and a generic HTTP tool reach n8n
  and Home Assistant, which do that job better.
- **Not a CRM.**
- **Not analog-capable.** Bridge an analog line with an ATA; OpenDial only speaks SIP.

## Why it exists

Well-funded closed products already do "AI receptionist for business". What does not
exist is a good **open, self-hosted** one — where you own the recordings, choose the
models, and decide which callers ever reach the AI at all.

---

## Project status

**Pre-alpha. Not usable yet.** There is no installable release.

The project is at Milestone 0: getting a single real phone call answered by an AI
voice, with the message captured and the transcript printed. Everything else — the web
UI, the database, Docker packaging, routing rules — comes after that works.

The build order is deliberate. The previous attempt at this stalled with plenty of
plan and no answered call.

| # | Milestone | Status |
|---|---|---|
| 0 | First call — script answers, speaks, listens, takes a message | In progress |
| 1 | Provider interfaces (STT / LLM / TTS) | Not started |
| 2 | Persistence — Postgres, calls and transcripts | Not started |
| 3 | Routing rules — whitelist / blacklist / AI | Not started |
| 4 | Web UI | Not started |
| 5 | Webhooks + documented REST API | Not started |
| 6 | Built-in tools | Not started |
| 7 | Live intervention — whisper, then takeover | Not started |
| 8 | Health checks + alerts | Not started |
| 9 | Docker packaging — one-command install | Not started |
| 10 | MCP server | Not started |

Watch or star the repository if you want to know when it becomes installable.

---

## Planned architecture

| Layer | Choice |
|---|---|
| Voice agent | Python + [LiveKit Agents](https://github.com/livekit/agents) |
| API | Python + FastAPI |
| Frontend | Next.js + React |
| Database | PostgreSQL — transcripts need real full-text search |
| Cache / queue | Redis |
| Reverse proxy | Caddy — automatic HTTPS |
| Packaging | Docker Compose |

**Providers for v1:** Deepgram (STT) · one cloud LLM · ElevenLabs (TTS).
Local models (Ollama, Whisper, Piper) follow in v1.1 — they need a GPU to hold a
natural conversation, so they are not the default.

**Latency target:** under 800 ms from the end of caller speech to the first audio out.
Everything streams; the first sentence starts speaking while the rest is still being
generated.

---

## Quick start

Not available yet. Once Milestone 9 lands, this section becomes:

```bash
git clone https://github.com/Dpro-at/OpenDial.git
cd OpenDial
cp .env.example .env    # add your API keys
docker compose up -d
```

Until then, see [`docs/SPEC.md`](docs/SPEC.md) for the full design and
[`CLAUDE.md`](CLAUDE.md) for the development rules.

### Requirements when it ships

- A SIP endpoint — an extension on an existing PBX, or a purchased number
- API keys for an STT, an LLM, and a TTS provider (or a GPU for local models)
- A machine on the same LAN as the PBX
- Network access to the PBX on 5060/UDP and an open RTP port range

---

## Security notes

- **Do not expose the port to the internet.** VPN, Tailscale, or a reverse proxy with
  HTTPS are the supported paths.
- **A password is required on first run.** There are no default credentials.
- **API keys are encrypted at rest** and are never returned in full to the client.
- **Recording announcements are on by default.** Austria requires both parties to be
  aware that a call is recorded, and the requirement still applies once a human takes
  over from the agent.

---

## Contributing

Contributions are welcome, but note the current state: until Milestone 0 works,
pull requests adding features will be pointed at [`IDEAS.md`](IDEAS.md) rather than
merged. That is not a judgement on the idea — it is how this project stays finishable.

**All contributors must sign the [CLA](CLA.md)** before their first pull request is
merged. See [`CLAUDE.md`](CLAUDE.md) for code conventions. Everything in the
repository — code, comments, commit messages, documentation — is written in English.

---

## License

[AGPL-3.0](LICENSE). Copyright © Dpro GmbH.

If you run a modified version of OpenDial as a network service, you must publish your
modifications. The free version is never crippled; it is the product.

For a commercial license permitting closed-source integration, contact
Dpro GmbH at [info@dpro.at](mailto:info@dpro.at).

Dpro GmbH · Wipplingerstraße 20/18, 1010 Wien, Austria · FN 631492s, Handelsgericht Wien
