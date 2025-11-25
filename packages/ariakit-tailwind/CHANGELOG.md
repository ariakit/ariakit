# @ariakit/tailwind

## 0.1.9

- Updated packages to target ES2018 (previously ES2017).

## 0.1.8

- Added new `ak-bordering` utility.
- Adjusted the border color in light mode to be slightly darker.

## 0.1.7

- Fixed `ak-edge-contrast` for mid-tone colors.

## 0.1.6

- Updated `ak-layer-mix` to use `0` as the default level.

## 0.1.5

- Adjusted `ak-edge` opacity calculation to be more accurate.

## 0.1.4

### `ak-layer-pop` and `ak-layer-hover`

The old `ak-layer-pop` behavior has been renamed to `ak-layer-hover` to better reflect its purpose. Now, `ak-layer-pop` works like the other `ak-layer-*` utilities, allowing you to combine `ak-layer-pop hover:ak-layer-hover`.

### Other updates

- Improved `ak-layer-*` utilities to accept bare values such as `ak-layer-0.5`.
- Added `ak-frame-cover-start` and `ak-frame-cover-end` utilities to ensure the top and bottom cover edges are correctly applied when they aren't automatically detected.

## 0.1.3

- Improved performance.
- Fixed `ak-layer-mix-<color> hover:ak-layer-pop` combination.
- Adjusted the base alpha value for `ak-text/<number>` on dark layers.

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
