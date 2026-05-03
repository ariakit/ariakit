# @ariakit/tailwind

## 0.2.1

- Added `ak-edge-inherit` and `ak-frame-bordering-inherit` utilities.

## 0.2.0

### Ariakit Tailwind v0.2

**BREAKING** for projects using the v0.1 utility API.

The plugin has been rewritten around explicit base utilities such as `ak-layer`, `ak-frame`, `ak-text`, and `ak-outline`, with separate modifiers for color, lightness, chroma, hue, opacity, and frame geometry. This unlocks full relative color manipulation across layers, text, edges, and outlines while making the class names more predictable for automated migrations. It also moves interactive state changes to `ak-state-*` utilities and replaces slash opacity/value syntax with explicit hyphenated utilities.

Before:

```html
<body class="ak-layer-canvas">
  <button class="ak-layer-pop ak-frame-field ak-edge/10">
    <span class="ak-text-primary/70">Save</span>
  </button>
</body>
```

After:

```html
<body class="ak-layer ak-layer-canvas">
  <button class="ak-layer ak-layer-6 ak-frame ak-frame-field/field ak-edge-10">
    <span class="ak-text ak-text-primary">Save</span>
  </button>
</body>
```

Rendering performance has been significantly improved by making utility setup more explicit and reducing repeated color work in generated utilities. Some scenarios can render more than 90% faster.

See the [v0.2 migration guide](https://github.com/ariakit/ariakit/blob/main/packages/ariakit-tailwind/migrating-to-v02.md) for detailed upgrade steps and the [README](https://github.com/ariakit/ariakit/blob/main/packages/ariakit-tailwind/readme.md) for the full v0.2 API.

## 0.1.11

- Adjusted edge color rendering in `@ariakit/tailwind` to preserve chroma-aware alpha blending for edge utilities so border and ring output remains consistent with intended contrast and saturation behavior, including when using `ak-edge`, `ak-edge-shadow`, and mixed layer color scenarios.
- Added frame-related utility aliases and controls in `@ariakit/tailwind`, including `ak-border`, `ak-ring`, `ak-bordering`, `ak-frame-p-*`, `ak-frame-m-*`, `ak-frame-rounded-*`, and `ak-frame-rounded-force-*`, and refined frame context propagation so nested radius, border, ring, and spacing calculations stay synchronized in cover/overflow layouts.
- Added new layer utilities and state behavior in `@ariakit/tailwind`, including `ak-layer-level-*`, `ak-layer-current`, and `ak-layer-invert`, and updated layer composition so `ak-layer`, `ak-layer-contrast`, `ak-layer-mix`, and hover/pop utilities can target idle/state/modifier layer channels more predictably across nested contexts.

## 0.1.10

### New custom variants

- `ak-disabled`
- `ak-disabled-within`
- `ak-active`
- `ak-hover`
- `ak-focus-visible`
- `ak-checked`
- `ak-checked-within`

### Moved CSS custom properties outside the `base` layer

This should resolve most bundler warnings about `Unknown at rule: @property`. Some custom properties are still defined inside a `@supports` block. Browsers handle this fine, but bundlers may still warn. This has no runtime impact.

### New `ak-frame` utilities

Added `ak-frame-rounded-*` and `ak-frame-p-*` utilities to set specific border radii and padding. Use them to override the border radius and padding defined by `ak-frame-*/*`.

### Other updates

- Improved runtime performance and reduced CSS output size.

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
