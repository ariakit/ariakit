# @ariakit/tailwind

## 0.1.2

### New `ak-frame-overflow` utility

`ak-frame-overflow` is similar to `ak-frame-cover`, but it accounts for the parent frame's border width instead of the current element's.

### Other updates

- Updated `@import "tailwindcss"` to `@reference "tailwindcss"`.
- `ak-text` now defaults to `ak-text/100` instead of `ak-text/0`.
- Fixed mid-tone adjustment calculation.
- Softened `ak-layer-contrast` base multiplier from `0.3` to `0.25`.
- Doubled `ak-layer-contrast` multiplier based on the `--contrast` theme token.
- Updated `ak-layer-mix-<number>` so that it can be used on an element that already includes a layer utility.
- Updated `ak-layer-pop` so that it considers the layer applied to the current element rather than its parent element.
- Updated `ak-layer-pop-vivid` so that it considers the layer applied to the current element rather than its parent element.
- Removed the `ak-edge` lightness limit.
- Updated `ak-frame-cover` to account for the current element's border width when calculating the negative margin.

## 0.1.1

- Fixed `ak-layer` and `ak-frame` utilities not working in production.
- Fixed `ak-edge` custom properties inheritance.

## 0.1.0

- Initial version.
