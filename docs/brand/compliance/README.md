# Compliance badges

Dpro GmbH badges, reused from the Flowxtra registration page.

| File | Claim |
|---|---|
| `gdpr-dsgvo.png` | DSGVO & GDPR compliant |
| `eu-ai-act.png` | EU AI Act compliant |
| `esign.png` | ESIGN compliant |
| `eidas.png` | eIDAS |
| `aes-256.png` | AES verified 256 |

Each is a white card with rounded, transparent corners — so they stay legible on
GitHub's dark theme without a second variant. Native size is 169×46 (154×42 for
`aes-256.png`); the README renders them at `height="34"`.

## Two of these describe a different product

`esign.png` and `eidas.png` are about **electronic signatures**. That is a
Flowxtra capability. Tel-Agent is a gateway between a phone line and an AI agent
and does not sign anything, so these two badges make a claim the software has no
surface for. They are in the README because they were asked for; deleting their
two lines from the block at the top is the whole removal.

`aes-256.png` reads "AES **verified** 256", which implies an external audit of a
crypto implementation. Tel-Agent is pre-alpha and has no release, so there is
nothing yet for anyone to have verified.

GDPR and the AI Act are, for a self-hosted product, properties of a deployment
rather than of a repository — the operator chooses the models, the region and the
retention. Worth keeping in mind before the badges are read as a certification.
