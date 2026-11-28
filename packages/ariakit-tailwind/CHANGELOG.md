# @ariakit/tailwind

## 0.3.0

### Base styles of `ak-layer` and `ak-frame` in a nested layer

**BREAKING** if you use the `important` option of Tailwind, if an element has `ak-layer`, `ak-frame`, `ak-frame-cover`, or `ak-frame-backdrop` with the `!` modifier and another utility with it, if CSS applies one of these utilities with `@apply` outside a cascade layer or in a layer with other rules for the same elements, such as the `base` layer, or if one of these utilities with a variant, such as `sm:ak-frame`, must override another utility on the same element.

The base styles of `ak-layer`, `ak-frame`, `ak-frame-cover`, and `ak-frame-backdrop` are now in a nested `ak` cascade layer inside the Tailwind `utilities` layer. Another utility on the same element now overrides them, whatever order Tailwind gives the two rules. Before, the result depended on that order, so a class such as `sr-only` could lose its `margin` to `ak-frame`, and `m-*` couldn't replace the stretch margin of `ak-frame-cover`.

```tsx
// The margin of sr-only now applies.
<h2 className="ak-frame sr-only">Settings</h2>
```

Modifier utilities such as `ak-layer-10` and `ak-frame-p-2` are not in the nested layer, and without important declarations they work as before.

A base utility with a variant, such as `sm:ak-frame` or `hover:ak-layer`, is in the nested layer too. It no longer overrides another utility on the same element, as it did when Tailwind sorted the variant later. Limit the other utility to the opposite condition:

Before:

```tsx
<div className="p-2 sm:ak-frame sm:ak-frame-p-6" />
```

After:

```tsx
<div className="max-sm:p-2 sm:ak-frame sm:ak-frame-p-6" />
```

In CSS outside a cascade layer, `@apply` puts these base styles in a top-level `ak` layer. Rules outside a layer now override them, such as a reset that sets `padding` on `button` elements. Move such rules into a layer, such as the `base` layer of Tailwind.

Before:

```css
button {
  padding: 0;
}

.segment {
  @apply ak-layer ak-frame;
}
```

After:

```css
@layer base {
  button {
    padding: 0;
  }
}

.segment {
  @apply ak-layer ak-frame;
}
```

In a rule inside a cascade layer, `@apply` puts these base styles in an `ak` layer nested in that layer. Every rule directly in that layer then overrides them, whatever its specificity. In the `base` layer, this includes Preflight, which resets properties such as the `margin` and `padding` of every element and the text color of links and buttons. Apply the base utilities in a later layer, such as `components`, and keep element rules out of that layer:

Before:

```css
@layer base {
  .card {
    @apply ak-layer ak-frame;
  }
}
```

After:

```css
@layer components {
  .card {
    @apply ak-layer ak-frame;
  }
}
```

A stylesheet that the browser can read before the main Tailwind stylesheet, such as a CSS module or a component style block that uses `@reference`, would declare that `ak` layer first. The layers of Tailwind, Preflight included, would then override it. Declare the layer order of Tailwind in such a stylesheet:

Before:

```css
@reference "../app.css";

.card {
  @apply ak-layer ak-frame;
}
```

After:

```css
@reference "../app.css";
@layer theme, base, components, utilities;

.card {
  @apply ak-layer ak-frame;
}
```

Cascade layers reverse the order of important declarations, so when both sides are important, the cases above turn around. With the `important` option of Tailwind, the base styles now override every other utility that sets the same property on the same element, the modifier utilities of this package included. For example, `ak-layer-transparent` and `ak-ink-*` no longer change the colors of an element with `ak-layer`, and `ak-frame-cover` no longer stretches an element with `ak-frame`. A base utility with the `!` modifier, such as `ak-frame!`, now overrides every other important utility that sets the same property, such as `p-4!`. With `!` in `@apply`, such as `@apply ak-frame!`, the base styles now override the important rules outside a layer, or directly in the same layer, that set the same property. The other paragraphs describe normal declarations.

### Other updates

- Reduced the minified CSS that Tailwind 4.2 or later compiles for each variant of `ak-text` by 31% to 39%, `ak-edge-contrast` by 55% to 59%, and `ak-layer-contrast` by 34% to 37% in the Ariakit site CSS, without changes to the resulting colors.

## 0.2.11

### New `ak-frame-divide` utility

The new `ak-frame-divide` utility draws a border only on the sides of a frame that face a sibling in the parent flow. The first frame omits its start side, and the last frame omits its end side. Use it on a cover frame, such as a dialog footer or a header band, to draw one line between it and the content while the parent edge stays as it is on the other sides.

```html
<div class="ak-layer ak-frame ak-frame-2xl/4 ak-frame-border flex flex-col">
  <p>Body</p>
  <div
    class="ak-layer ak-layer-darken-3 ak-frame ak-frame-cover ak-frame-divide"
  >
    Footer
  </div>
</div>
```

In a parent with `ak-frame-row`, the lines follow the text direction. `ak-frame-divide-*` sets the width, and `ak-frame-divide-inherit` takes the width of the parent frame edge. The cover stretch and the radius of nested frames stay the same, so the corners stay concentric.

### Layer appearance variants for `ak-outset` elements

The new `ak-outset-*` variants, such as `ak-outset-dark` and `ak-outset-light-high`, match the layer around the parent layer on an element with `ak-outset`. This is the surface behind the element, such as the page under a bar below a selected tab. The regular variants, such as `ak-dark`, keep matching the parent layer, which can have the opposite appearance. An example is a tab that high contrast mode fills with a dark color on a light page.

```html
<div class="ak-layer ak-layer-white">
  <button class="ak-layer ak-layer-black relative">
    Selected tab
    <span
      class="ak-layer ak-layer-contrast ak-outset ak-outset-light:h-[3px] ak-outset-dark:h-[2px] absolute inset-x-0 top-full"
    ></span>
  </button>
</div>
```

Each layer appearance variant has an `ak-outset-*` counterpart, and `not-*` works with them, such as `not-ak-outset-dark`.

### Smoother nested `ak-frame` radius between `0.5rem` and `1rem`

A nested `ak-frame` took the concentric radius until it was `1rem` from the parent edge, and its declared radius from there. When the distance was larger than the parent radius, the concentric radius was the `0.125em` minimum. Thus, a frame was almost square just before it became fully round.

Between `0.5rem` and `1rem` from the parent edge, the radius now goes in a straight line from the concentric radius at `0.5rem` to the declared radius at `1rem`. If the declared radius is the smaller of the two, the frame keeps the concentric radius until that radius is equal to the declared radius. Frames in this range can become rounder, and a frame with a full declared radius, such as `ak-frame-rounded-full`, is a pill in this range. Frames up to `0.5rem` from the parent edge do not change, and neither do frames whose concentric radius is larger than their declared radius.

```html
<div class="ak-frame ak-frame-xl/3.5">
  <!-- Before: 0.125em. After: 0.625rem. At ak-frame-xl/4: 0.75rem -->
  <div class="ak-frame ak-frame-xl"></div>
</div>
```

Add `ak-frame-force` to a nested frame to use its declared radius at each distance.

This update also fixes a frame in a parent with a full radius, such as `ak-frame-rounded-full`. In Firefox and Safari, that frame stayed a pill at `1rem` or more from the parent edge. It now takes its declared radius there, as in Chrome.

## 0.2.10

### Contrast floors for edges and layers

Two utilities now keep a color at 3:1 or more against the parent layer, which is the contrast that WCAG asks for the boundary of a control and its state. A floor aims 2.5% over its ratio, and a color that already reaches that keeps its color. The `contrast-more` variant raises 3:1 to 4.5:1, and `ak-disabled` lowers it to 1.5:1 by default.

- **New `ak-edge-contrast` utility.** It keeps an edge at 3:1, such as the border of a text field. With the default push, a neutral edge becomes plain black or white and raises its alpha. An edge with a color becomes solid and moves its lightness toward the floor.

- **`ak-layer-contrast` keeps its resting color at 3:1.** It still moves the lightness away from the parent layer, now by `30` instead of `25` by default, and then moves a color that is still short of 3:1, such as the fill of a checked checkbox on a brand surface. State utilities, such as `hover:ak-state-6`, apply on top of the resting color and can move it under the ratio. A color that has to move can land well over the ratio, because a layer skips the mid-lightness range. The amount now sets the ratio, and each further `30` multiplies it by 3, so `ak-layer-contrast-41` keeps about 4.5:1. Lower amounts, such as `ak-layer-contrast-10`, separate a surface without the 3:1 guarantee. A translucent layer with `ak-layer-contrast` becomes opaque.

```html
<input
  class="ak-layer ak-layer-lighten-6 ak-frame ak-frame-field/field ak-frame-border ak-edge-contrast"
/>
<input
  class="ak-layer ak-layer-lighten-6 ak-frame ak-frame-field/field ak-frame-border ak-edge-warning ak-edge-raw ak-edge-contrast"
/>
<div class="ak-layer ak-layer-primary">
  <input type="checkbox" class="ak-layer ak-layer-primary ak-layer-contrast" />
</div>
```

The README describes the cases that the [edge floor](https://github.com/ariakit/ariakit/blob/main/packages/ariakit-tailwind/readme.md#contrast-floor) and the [layer floor](https://github.com/ariakit/ariakit/blob/main/packages/ariakit-tailwind/readme.md#layer-contrast-floor) don't cover.

### New `ak-frame-backdrop` utility

The new `ak-frame-backdrop` utility makes `ak-frame-bordering-inherit` draw a border. A cover frame stretches by its own border width, so its edge lies on the parent edge, and an inherited ring there would double the translucent parent ring. When the parent edge is a ring, `ak-frame-backdrop` also paints the parent layer beneath the border. When the parent layer matches the surface around the parent, the border then looks like the ring and covers it, even when the cover is lighter or darker than its parent. On a parent border, such as on dark surfaces, it draws a plain border.

```html
<div class="ak-layer ak-frame ak-frame-xl/2 ak-frame-bordering">
  <p>Ring on light surfaces, border on dark ones</p>
  <div
    class="ak-layer ak-layer-lighten-2 ak-frame ak-frame-cover ak-frame-bordering-inherit ak-frame-backdrop ak-edge-inherit"
  ></div>
</div>
```

Use `ak-frame-backdrop-*` to paint another surface beneath the border. On a parent whose layer differs from the surface around it, such as a lightened, darkened, numeric, or color layer, pass that surface, such as `ak-frame-backdrop-(--card-surface)` with `[--card-surface:var(--ak-layer-parent)]` on the parent. Frames that form one shape can share a backdrop the same way. The new `--ak-frame-backdrop` variable holds the surface under each frame edge, so custom edge drawings can paint it under their strokes.

### New `ak-layer-fade-*` utility

The new `ak-layer-fade-*` utilities fade a layer toward the parent layer after the lightness offset, push, and bounds. Use them for a surface whose lightness comes from a push, such as an inverted surface. `ak-layer-mix-*` applies before the push, so it can't fade a push that always reaches its bound.

```html
<button
  class="ak-layer ak-layer-push-100 ak-layer-min-l-23 ak-layer-max-l-96 ak-layer-fade-80"
>
  Vote
</button>
```

When a layer with a lightness offset or push fades into the forbidden mid-lightness range, it stays on the far side of the range from the parent layer, so it remains distinct from a mid-tone parent layer.

### New `ak-outset` utility

The new `ak-outset` utility makes an element take its color context from the layer around its parent layer. Use it on an element that paints outside its parent's box, such as a bar below a selected tab, so it adapts to the surface behind it instead of its parent. It applies to `ak-layer` and its modifiers, including `ak-layer-mix` and `ak-layer-contrast`, and to `ak-text` and `ak-outline` on the same element.

```html
<div class="ak-layer ak-layer-canvas">
  <button
    class="ak-layer ak-layer-primary relative ak-frame ak-frame-field/field"
  >
    Selected tab
    <span
      class="ak-layer ak-layer-contrast ak-outset absolute inset-x-0 -bottom-2 h-0.5"
    ></span>
  </button>
</div>
```

Put `ak-outset` on a direct child of an `ak-layer` element. Its descendants keep measuring from their own parent layer.

### Other updates

- Fixed nested `ak-frame` elements keeping a minimum radius of `0.125rem` when their parent's padding covers the parent's radius. The minimum is now `0.125em`, so frames scaled down through their font size stay concentric with their parents.

## 0.2.9

### Ink inherits through nested layers

The opacity that `ak-ink-*` requests now inherits. An `ak-layer` inside dimmed text keeps that ink and recomputes the readable floor against its own background, instead of resetting its text to full strength. An icon or a badge inside a dimmed button now dims with the button.

This changes how existing markup renders when an `ak-layer` sits inside an element with `ak-ink-*`. Add `ak-ink-100` to a nested layer that must keep full-strength text.

```html
<div class="ak-layer ak-ink-70">
  <span class="ak-layer ak-layer-primary">Still 70% ink</span>
  <span class="ak-layer ak-layer-primary ak-ink-100">Full ink</span>
</div>
```

## 0.2.8

### Added `ak-layer-transparent`

The `ak-layer` utility always paints its resolved color. Against the parent layer that paint is invisible, but it is still opaque, so a control that opens a layer only to give its descendants a color context covers whatever is drawn behind it, such as a moving highlight at a negative z-index.

The new `ak-layer-transparent` utility makes that paint conditional. The element paints nothing at rest, and paints the layer color as soon as a modifier applies one, including under a variant such as `hover:` or `aria-selected:`.

```tsx
<button className="ak-layer ak-layer-transparent hover:ak-state-10">
  Transparent at rest, painted on hover
</button>
```

### Shared borders for adjacent frames

Use `ak-frame-join` with `ak-frame-join-item` children to draw one edge between adjacent surfaces. It supports rows, columns, RTL, frame borders, and outside rings. Apply `ak-frame-join-active` through hover or selection variants to give an item ownership of its neighboring edges. These utilities also work through `@apply` in custom CSS classes.

Native border joins require the browser's rendered width to match the declared width. Pixel rounding can break that alignment for fractional widths and at some zoom levels. Use frame rings for fractional edges.

```tsx
<div className="ak-frame ak-frame-row ak-frame-join flex">
  <button className="ak-layer ak-frame ak-frame-lg/2 ak-frame-border ak-frame-join-item hover:ak-frame-join-active">
    Day
  </button>
  <button className="ak-layer ak-frame ak-frame-lg/2 ak-frame-border ak-frame-join-item hover:ak-frame-join-active">
    Week
  </button>
</div>
```

### Disabled contrast utility

The new `ak-disabled` utility applies the same contrast settings as a disabled attribute. Use it on a control surface that does not carry the attribute, such as a file input's label. Descendant layers and text inherit the settings.

```tsx
<label className="ak-layer ak-disabled ak-ink-0">
  <input type="file" disabled className="sr-only" />
  Upload attachment
</label>
```

### Inert layer longhands no longer mark a color change

`ak-layer-mix-color-*`, `ak-layer-mix-amount-*`, and `ak-layer-mix-method-*` only fill in values that the mixing utilities read, and `ak-layer-contrast-*` only fills in the amount that `ak-layer-contrast` reads. Without that partner on the same element, the resolved layer color never moves.

They were still marked as color changes, and that mark is also what makes `ak-layer-transparent` paint. So a nested layer carrying only these longhands reapplied the global contrast bias instead of inheriting its parent color whenever `--contrast` was above `0`, and, with `ak-layer-transparent`, it would have painted a background instead of staying see-through.

```tsx
<div className="ak-layer">
  {/* Inherits the parent color, like a bare ak-layer */}
  <div className="ak-layer ak-layer-mix-color-red-500" />
  <div className="ak-layer ak-layer-contrast-50" />
  {/* Still moves the color, and still counts as a color change */}
  <div className="ak-layer ak-layer-mix ak-layer-mix-color-red-500" />
  <div className="ak-layer ak-layer-contrast ak-layer-contrast-50" />
</div>
```

### Other updates

- Fixed `ak-frame` adding a zero-width ring shadow to frames without a ring, which Firefox painted as faint arcs at rounded corners. Only the utilities that set a ring width, such as `ak-frame-ring` and `ak-frame-bordering`, now add the ring shadow.
- Fixed faint rounded-corner shadows in Firefox when adaptive frame bordering selects a border.
- Fixed adaptive and ring frame boundaries disappearing in forced colors.

## 0.2.7

- Fixed bare `ak-layer` elements to preserve inherited background colors when the global contrast setting increases.

## 0.2.6

- Expanded the README with a material mental model and practical examples for composing layers, interactive states, frames, and contextual colors, and corrected the v0.2 contrast migration guidance.

## 0.2.5

### Frame covers support RTL rows

Fixed `ak-frame-cover` to apply stretch margins and corner rounding to the correct logical sides in RTL rows.

Since `ak-frame-cover` now uses logical CSS properties, override its stretch margin with axis or side utilities such as `mx-*`, `my-*`, `ms-*`, or `me-*` instead of the bare `m-*` shorthand on the same element. Covers should also inherit their frame's `dir` and `writing-mode`; apply direction changes inside the cover when the content needs a different flow.

### Other updates

- Fixed `ak-light-high:` to match layers at the exact lightness boundary shared with `ak-light-low:`.
- Fixed `ak-layer-push-*` and `ak-state-push-*` in `@ariakit/tailwind` to escape the forbidden lightness band based on the current layer, regardless of the parent layer.

## 0.2.4

### Improved `ak-layer`, `ak-edge`, and `ak-text` style recalculation performance

Layer and edge colors now resolve fewer intermediate colors per element. In browsers that support the CSS `if()` function, `ak-text` delivers its quantized lightness table as four conditional declarations instead of one rule per quantized step, which removes most of its selector matching work — especially under child variants such as `*:ak-text`.

## 0.2.3

- Made the `--ak-edge` CSS custom property inheriting so descendants of an `.ak-layer` element can read it directly.
- Improved the rendering performance of the layer utilities by reducing redundant per-element style work in the generated CSS.

## 0.2.2

- Fixed `ak-edge-inherit` and `ak-frame-bordering-inherit` to inherit from the nearest ancestor that explicitly configures a frame border, ring, or bordering width.

## 0.2.1

### Removed `ak-layer-invert`

**BREAKING** if you're using the `ak-layer-invert` utility.

The `ak-layer-invert` utility has been removed. Use the `ak-layer-l-*` utility with a raw expression and the `ak-layer-min-*` lightness clamp instead.

Before:

```tsx
<div className="ak-layer ak-layer-invert" />
```

After:

```tsx
<div className="ak-layer ak-layer-l-[calc(1-l)] ak-layer-min-25" />
```

### Other updates

- Added `ak-edge-inherit` and `ak-frame-bordering-inherit` utilities.
- Fixed `ak-layer-offset-*` and `ak-layer-push-*` utilities to use `ak-layer-min-*` and `ak-layer-max-*` lightness limits on the resolved target before escaping the forbidden mid-luminance range.
- Fixed `ak-layer-push-*` and `ak-state-push-*` utilities so targets inside the forbidden mid-luminance range move to the boundary on the other side, while targets that already land outside the range stay untouched.
- Fixed zero-value `ak-layer-push-*` and `ak-state-push-*` utilities to activate push behavior while keeping the push distance at zero.
- Fixed `ak-layer-contrast` to compose with the bounded `ak-layer-push-*` target instead of ignoring the pushed layer lightness.

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
