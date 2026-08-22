<div align="center">

# Tel-Agent

**Connect any phone line to any AI model. Self-hosted, bring your own keys.**

[![License: AGPL v3](https://img.shields.io/badge/License-AGPL_v3-blue.svg)](LICENSE)
[![Status: pre-alpha](https://img.shields.io/badge/status-pre--alpha-orange.svg)](#project-status)

[tel-agent.com](https://tel-agent.com) · maintained by [Dpro GmbH](https://dpro.at), Vienna

</div>

---

## What it is

Tel-Agent is an open-source gateway that sits between a phone line and an AI agent.

A call arrives over SIP. Tel-Agent checks the caller against your routing rules and
either passes it through to a human, blocks it, or hands it to an AI agent. The agent
speaks with the caller in real time, can invoke tools — transfer the call, take a
message, check a calendar, call any HTTP endpoint — and every call is recorded,
transcribed, and searchable.

It runs on your own hardware, on your own LAN, with your own API keys.

The phone comes first and is the hardest case. After it works, the same agent answers
on **web chat, SMS, email, WhatsApp, Telegram, Messenger, Instagram and Discord** —
connected with your own credentials from each platform, never a shared application of
ours. **Nine channels, and the list is closed.** A channel is a route a customer uses
to reach you; a system you run your own business on is an integration, and those are
reached through webhooks and the HTTP tool.

## What it is not

- **Not a PBX replacement.** It connects to your existing PBX (3CX, Asterisk, FreePBX)
  as an extension.
- **Not a workflow automation platform.** Webhooks and a generic HTTP tool reach n8n
  and Home Assistant, which do that job better. A *channel* is where the conversation
  happens; an *integration* is a system the agent acts on. We own the first and reach
  the second through the HTTP tool.
- **Not a CRM.**
- **Not analog-capable.** Bridge an analog line with an ATA; Tel-Agent only speaks SIP.

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

**Milestone 0 of 12 — in progress.** The full plan, and what each milestone means, is
in [`docs/ROADMAP.md`](docs/ROADMAP.md).

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
git clone https://github.com/Dpro-at/Tel-Agent.git
cd Tel-Agent
cp .env.example .env    # add your API keys
docker compose up -d
```

Until then, see [`docs/SPEC.md`](docs/SPEC.md) for the full design and
[`CLAUDE.md`](CLAUDE.md) for the development rules.

### Requirements when it ships

- API keys for an STT, an LLM, and a TTS provider (or a GPU for local models)
- A machine on the same LAN as the PBX
- Network access to the PBX on 5060/UDP and an open RTP port range
- A SIP endpoint. Most lines already are one:

| Your line | What you need | Extra hardware |
|---|---|---|
| A PBX — 3CX, Asterisk, FreePBX | An extension on it | None |
| A landline from an ISP | These are IP-based now. Either the provider gives you SIP credentials, or your router acts as a SIP registrar and you register against it — common with Fritz!Box in Austria and Germany | None |
| A genuinely analog line — old copper, a fax line | An ATA to bridge it, e.g. a Grandstream HT801 | ~€30 |

Tel-Agent only ever speaks SIP. That is deliberate: supporting telephony hardware
directly is a project of its own, and an ATA solves it for about the price of a
cable.

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
merged. Read [`CONTRIBUTING.md`](CONTRIBUTING.md) before opening one. Everything in the
repository — code, comments, commit messages, documentation — is written in English.

Found a security problem? **Do not open a public issue** — see
[`SECURITY.md`](SECURITY.md).

---

## License

[AGPL-3.0](LICENSE). Copyright © Dpro GmbH.

If you run a modified version of Tel-Agent as a network service, you must publish your
modifications. The free version is never crippled; it is the product.

For a commercial license permitting closed-source integration, contact
Dpro GmbH at [info@dpro.at](mailto:info@dpro.at).

Dpro GmbH · Wipplingerstraße 20/18, 1010 Wien, Austria · FN 631492s, Handelsgericht Wien
