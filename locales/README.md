# locales/ — en · de · ar

Every user-facing string. **This is infrastructure, not content work.**

Multi-language is in from day one because retrofitting it is expensive: it means
touching every component that was built assuming English string lengths.

| Locale | Notes |
|---|---|
| `en/` | Source language. Strings are written here first. |
| `de/` | German. The primary market is Austria, so this is the realistic case, not a translation afterthought. |
| `ar/` | Arabic. Requires full RTL. |

## What this forces on the UI

**German runs about 30% longer than English.** No fixed-width buttons or labels
anywhere. Every layout must survive 1.4× string expansion without breaking.

**Arabic requires a mirrored layout** and mirrored directional icons — arrows,
chevrons. **But Latin-script data stays left-to-right**: phone numbers, API keys,
timestamps, logs, code. An Arabic transcript with an LTR timestamp column is exactly
the case to get right.

**Dates, times and number formats follow the selected locale**, not the browser.

## Rules

- No string is hardcoded in a component. If it can be read by a user, it lives here.
- Latin-script *data* is never translated — only interface text is.
- More languages arrive through community pull requests. The three here are the ones
  the project commits to keeping current.

## Right now

Empty. Files arrive with the UI at Milestone 4.
