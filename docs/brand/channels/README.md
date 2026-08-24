# Channel icons

The icons in the README's opening row, one file each.

> **Ten icons, nine channels.** The prose in the README still reads "Nine
> channels, and the list is closed", and Slack is not one of the nine. The row
> and the sentence disagree; one of them needs to move.

| File | Channel | Origin | Colour |
|---|---|---|---|
| `phone.svg` | Phone | Drawn here (Material "call" glyph) | `#8B5CF6` |
| `web-chat.svg` | Web chat | Drawn here (Feather "globe") | `#8B5CF6` |
| `sms.svg` | SMS | Drawn here (Material "sms" glyph) | `#8B5CF6` |
| `email.svg` | Email | Drawn here (Material "email" glyph) | `#8B5CF6` |
| `whatsapp.svg` | WhatsApp | SVG Repo, CC0 | Brand green |
| `telegram.svg` | Telegram | Simple Icons style | `#0088cc` |
| `messenger.svg` | Messenger | Meta's mark | `#0084FF` |
| `instagram.svg` | Instagram | Simple Icons style | Brand gradient |
| `discord.svg` | Discord | Simple Icons style | `#5865F2` |
| `slack.png` | Slack | 96×96, resized from a 1280px source | Brand four-colour |

## Why `#8B5CF6` and not a palette violet

Phone, web chat, SMS and email have no owner and no brand mark, so they are drawn
as plain glyphs in a single colour. That colour is deliberately **not** the
palette's `#A78BFA` or `#6D28D9`: GitHub serves this README on a white page and
on a near-black one, and each of those violets washes out against one of them.
`#8B5CF6` sits between the two and clears 3:1 against both, which is the contrast
floor for a graphic.

The five branded marks keep their own colours, which are mid-tone already and need
no such adjustment.

## Spacing

A newline between two `<img>` collapses to a single space, so the icons render
almost touching. GitHub strips `style` from README HTML, which rules out margins
— the separator has to be content, and the row uses `&nbsp;&nbsp;` per gap.

## Sizing

Every file is a 24×24 glyph except `whatsapp.svg` (a 58×58 Illustrator export)
and `slack.png` (a 96×96 raster, the only format the mark was available in). Both fill their viewBox, so at a shared `height` they render at matching
weight; the differing viewBox is not worth redrawing a trademark to fix.

## Trademarks

WhatsApp, Telegram, Messenger, Instagram, Discord and Slack are trademarks of their
respective owners. They appear here to name the channel a user would reach us on
— nominative use — and imply no endorsement of, or affiliation with, Tel-Agent.
