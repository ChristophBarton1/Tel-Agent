# AI model logos

The row under the tagline, which promises "any AI model": OpenAI, Claude, Gemini,
Mistral, Ollama, Perplexity, Copilot, Manus — in that order.

| File | Ink for the single-colour marks | For |
|---|---|---|
| `models-light.svg` | `#18181B` | GitHub's light theme |
| `models-dark.svg` | `#FFFFFF` | GitHub's dark theme |

## Why one strip and not eight images

The eight sources come from different places and disagree about everything: seven
are 24×24, Mistral's is 397×282; five carry their own brand colours, and OpenAI,
Ollama and Manus are single-colour marks painted with `currentColor`. Composing
them into one file fixes the alignment once, at build time, and reduces the README
to a single `<picture>`.

`currentColor` is the reason there are two files. Inside an `<img>` there is
nothing to inherit from, so those three marks resolve to black and vanish on a
dark page. Each strip therefore states the ink outright.

## Two traps, if this is ever rebuilt

**Paint attributes on the root.** Several of these logos set `fill` on their
`<svg>` element and nowhere else. Lift the body out of that root and the fill is
gone — the logo silently goes black. The build copies those attributes onto the
wrapping `<g>`.

**Editor metadata.** `mistral-ai.svg` is an Inkscape save carrying
`<sodipodi:namedview>` and `inkscape:*` attributes, whose `xmlns` declarations
also live on the root. Dropped into a strip they become unbound prefixes, and an
unbound prefix is not a cosmetic problem: the file stops being well-formed XML and
the browser refuses to render *any* of it. The build strips that metadata and then
parses the result to prove it.

## Trademarks

Each mark belongs to its owner and appears here to name a model Tel-Agent can be
pointed at. No endorsement or affiliation is implied.
