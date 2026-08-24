# Award seal

One seal, assembled here from two Flowxtra registration-page assets:
`product-of-the-day.svg` (laurel wreath, "Product of the day", "1st") and
`google-reviews.svg` (five gold stars over the Google mark).

| File | Wreath ink | For |
|---|---|---|
| `product-of-the-day-light.svg` | `#18181B` | GitHub's light theme |
| `product-of-the-day-dark.svg` | `#FFFFFF` | GitHub's dark theme |

Both are 340×174 with a **transparent background**, so the seal sits on GitHub's
own page colour instead of on a card of its own.

## Why there are two files

The wreath lockup is one compound path painted with `currentColor`. Inside an
`<img>` there is nothing to inherit from, so it resolves to black — invisible on
a dark page. A single transparent file therefore cannot serve both themes, and
the README pairs them with `<picture>`:

```html
<picture>
  <source media="(prefers-color-scheme: dark)" srcset="docs/brand/awards/product-of-the-day-dark.svg">
  <img src="docs/brand/awards/product-of-the-day-light.svg" alt="Product of the day - 1st" height="110">
</picture>
```

The gold of the stars and the four Google colours are mid-tone and carry
themselves on either page, so only the wreath ink differs between the two files.

## What this seal claims

It reads "Product of the day — 1st" with a five-star Google rating. Both are
**Flowxtra's**, earned by a shipped product with real reviewers. Tel-Agent is
pre-alpha, has no release, and has not placed anywhere — so on this README the
seal transfers one product's standing onto another. Worth a decision before the
repository goes public.
