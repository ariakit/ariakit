# Ariakit Tailwind

> **Experimental.** This package is currently experimental. Breaking changes might be introduced in patch or minor releases.

Ariakit Tailwind is a Tailwind CSS v4 plugin that brings Ariakit Styles to your projects. It enables developers to build accessible design systems with **relative colors and radii** instead of fixed values, giving end users full freedom to customize the theme without sacrificing visual consistency. Swap any token — a brand color, a radius, a spacing scale — and every derived surface, text, border, and shadow rebalances itself automatically.

Ariakit Tailwind is framework and library agnostic. It works with any frontend framework (React, Vue, Svelte, Astro, …) and any component library (Ariakit React, Radix UI, React Aria, …).

## Contents

- [Installation](#installation)
- [How it works](#how-it-works)
- [Theming](#theming)
- [`ak-layer`](#ak-layer) — background, text, border colors for a surface
- [`ak-ink`](#ak-ink) — text opacity inside a layer
- [`ak-text`](#ak-text) — colored text with automatic contrast
- [`ak-edge`](#ak-edge) — border and ring colors
- [`ak-outline`](#ak-outline) — outline colors
- [`ak-frame`](#ak-frame) — radius, padding, margin, borders, layout
- [`ak-state-*`](#ak-state) — interactive state adjustments
- [Variants](#variants)
- [Migrating to v0.2](#migrating-to-v02)

## Installation

1. [Install Tailwind v4](https://tailwindcss.com/docs/installation/using-vite).

2. Install Ariakit Tailwind:

   ```sh
   npm i @ariakit/tailwind
   ```

3. Import it alongside Tailwind in your CSS file:

   ```css
   @import "tailwindcss";
   @import "@ariakit/tailwind";
   ```

4. Apply the base layer to a container element (must **not** be `html` or `:root`):

   <!-- prettier-ignore -->
   ```html
   <body class="ak-layer ak-layer-white dark:ak-layer-gray-950">
   ```

   Or via `@apply`:

   ```css
   body {
     @apply ak-layer ak-layer-white dark:ak-layer-gray-950;
   }
   ```

## How it works

Ariakit Tailwind revolves around a few families of utilities:

- **[`ak-layer`](#ak-layer)** turns any element into a _layer_ — a surface with its own background, text, border, and shadow colors. Layers nest, and each nested layer shifts in lightness relative to its parent so stacked surfaces read correctly in both light and dark modes.
- **[`ak-ink`](#ak-ink)** sets the text opacity for the layer's own text. Safe to apply on the same element as `ak-layer` or on a descendant.
- **[`ak-text`](#ak-text)** colors inline text _inside_ a layer with automatic WCAG contrast. Must go on a descendant, not on the `ak-layer` element itself.
- **[`ak-edge`](#ak-edge)** colors borders and rings, adapting opacity and contrast to the layer behind them.
- **[`ak-outline`](#ak-outline)** colors outlines in the same adaptive way.
- **[`ak-frame`](#ak-frame)** handles radius, padding, margin, borders, and concentric-radius layout.

All color math uses [OKLCH](https://developer.mozilla.org/en-US/docs/Web/CSS/color_value/oklch), so modifiers like `ak-layer-warm-40` or `ak-text-saturate-50` behave predictably across hues. Because every value is computed relatively, changing a single theme token ripples through every layer, text, edge, and frame that depends on it — so users can reskin the whole system without breaking contrast, depth, or shape relationships.

## Theming

Ariakit Tailwind integrates directly with Tailwind's theming system. Every `--color-*`, `--radius-*`, and `--spacing-*` token in your `@theme` block becomes available to the matching Ariakit utilities.

```css
@theme {
  /* Any --color-* token can be used in ak-layer, ak-text, ak-edge, ak-outline */
  --color-canvas: #f1f1f1;
  --color-primary: #007acc;
  --color-secondary: #ec4899;

  /* Any --radius-* / --spacing-* token can be used in ak-frame.
   * Sharing names lets you reference both sides with a single modifier:
   * ak-frame-field/field applies --radius-field AND --spacing-field. */
  --radius-field: var(--radius-xl);
  --spacing-field: --spacing(2);

  --radius-container: var(--radius-xl);
  --spacing-container: --spacing(1);
}

/* Theme overrides per variant */
:root {
  @variant dark {
    --color-canvas: #0e0e11;
  }
}
```

With the theme above, you can use your custom colors anywhere Ariakit expects a color:

<!-- prettier-ignore -->
```diff
- <body class="ak-layer ak-layer-white dark:ak-layer-gray-950">
+ <body class="ak-layer ak-layer-canvas">
```

### Advanced theme tokens

Ariakit Tailwind exposes additional tokens beyond `--color-*`, `--radius-*`, and `--spacing-*`:

| Token family | Purpose                                                                                                                                                                        | Defaults                                                                                                                                                                                                                                                                                                                                            |
| ------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `--contrast` | Global contrast preference (`0`–`100`). Utilities like `ak-text` lift lightness as `--contrast` grows. Automatically set to `100` by the [`contrast-more`](#variants) variant. | `0`                                                                                                                                                                                                                                                                                                                                                 |
| `--chroma-*` | Named chroma presets for `ak-layer-*`, `ak-text-*`, `ak-edge-*`, `ak-outline-*`, and all `-c-*` / `-max-c-*` / `-min-c-*` utilities.                                           | `grayscale` (0), `muted` (0.05), `balanced` (0.15), `vivid` (0.22), `neon` (0.32)                                                                                                                                                                                                                                                                   |
| `--hue-*`    | Named hue presets (OKLCH degrees) for `-<hue>` / `-h-*` utilities.                                                                                                             | Absolute: `red`, `orange`, `yellow`, `green`, `cyan`, `blue`, `magenta`. Relational (relative to current hue): `complementary`, `split1`/`split2`, `analogous1`/`analogous2`, `triadic1`/`triadic2`, `tetradic1`/`tetradic2`/`tetradic3`, `square1`/`square2`/`square3`. `--hue-warm` and `--hue-cool` are used by `-warm-*` / `-cool-*` utilities. |
| `--mix-*`    | Named `color-mix()` interpolation methods used by `ak-layer-mix-*`.                                                                                                            | Every CSS color-mix method, e.g. `oklab`, `oklch`, `lab`, `lch`, `hsl`, `hwb`, `srgb`, `srgb-linear`, `display-p3`, `rec2020`, etc. Hyphen-separated forms like `shorter-hue` are available via `ak-layer-mix-shorter-hue`.                                                                                                                         |

Override any of these in your own `@theme` block:

```css
@theme {
  --contrast: 50;
  --chroma-balanced: 0.18;
  --hue-brand: 250;
  --hue-warm: var(--hue-orange);
}
```

---

## `ak-layer`

Layers are the foundation of Ariakit Styles. Every element with `ak-layer` is a surface with its own background, text, border, and shadow colors. Nested layers shift lightness relative to their parent — stacked cards read progressively lighter in light mode and progressively darker-to-lighter in dark mode, so depth is always visible.

```html
<body class="ak-layer ak-layer-canvas">
  <div class="ak-layer">Subtly lighter surface</div>
  <div class="ak-layer ak-layer-primary">Brand-colored surface</div>
</body>
```

A layer automatically sets border, ring, and shadow colors. Use [`ak-frame-border`](#ak-frame), [`ak-frame-ring`](#ak-frame), or Tailwind's `shadow` utilities to display them:

```html
<div class="ak-layer ak-frame ak-frame-border">Border from ak-layer</div>
<div class="ak-layer ak-frame ak-frame-ring">Ring from ak-layer</div>
<div class="ak-layer shadow-xl">Shadow from ak-layer</div>
```

Use [`ak-edge`](#ak-edge) to fine-tune border, ring, and shadow colors without touching the layer background.

### Setting the layer color

| Utility             | Description                                                                                                                                           |
| ------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------- |
| `ak-layer`          | Required base class. Sets background, text, border, and shadow colors.                                                                                |
| `ak-layer-<color>`  | Sets the layer to a specific color. Accepts any theme color (e.g. `ak-layer-primary`, `ak-layer-blue-500`) or arbitrary value (`ak-layer-[#131418]`). |
| `ak-layer-<number>` | Shifts lightness relative to parent layer (`0`–`100`). Nested `ak-layer` alone uses a sensible default step.                                          |
| `ak-layer-<chroma>` | Sets chroma from a named preset, e.g. `ak-layer-vivid`, `ak-layer-muted`. See `--chroma-*` tokens.                                                    |
| `ak-layer-<hue>`    | Sets hue from a named preset, e.g. `ak-layer-red`, `ak-layer-blue`. See `--hue-*` tokens.                                                             |

### Lightness adjustments

| Utility                      | Description                                                                                                                                 |
| ---------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------- |
| `ak-layer-lighten-<number>`  | Lightens the layer by `<number>`%. Accepts arbitrary values (`ak-layer-lighten-[0.05]`).                                                    |
| `ak-layer-darken-<number>`   | Darkens the layer by `<number>`%.                                                                                                           |
| `ak-layer-push-<number>`     | Minimum lightness shift (self-relative), jumping the forbidden mid-luminance range where contrast math becomes unreliable.                  |
| `ak-layer-contrast`          | Adapts the layer to contrast against its parent (preset `25`).                                                                              |
| `ak-layer-contrast-<number>` | Custom contrast amount (`0`–`100`, default `25`).                                                                                           |
| `ak-layer-invert`            | Inverts lightness (clamped so the result is never pure black).                                                                              |
| `ak-layer-l-<value>`         | Sets absolute lightness. Accepts a percentage (`ak-layer-l-80`), a raw value (`ak-layer-l-[0.8]`), or any valid OKLCH-lightness expression. |
| `ak-layer-max-<value>`       | Caps lightness at `<value>` (percentage, `[value]`) or caps chroma with a named chroma preset (`ak-layer-max-muted`).                       |
| `ak-layer-min-<value>`       | Floors lightness or chroma, same form as `max-*`.                                                                                           |

### Hue adjustments

| Utility                      | Description                                                                                                                          |
| ---------------------------- | ------------------------------------------------------------------------------------------------------------------------------------ |
| `ak-layer-warm-<number>`     | Shifts hue toward `--hue-warm` by `<number>`%, along the shortest arc.                                                               |
| `ak-layer-cool-<number>`     | Shifts hue toward `--hue-cool` by `<number>`%, along the shortest arc.                                                               |
| `ak-layer-h-<value>`         | Sets absolute hue. Accepts a named hue (`ak-layer-h-blue`), a degree (`ak-layer-h-240`), or arbitrary value (`ak-layer-h-[240deg]`). |
| `ak-layer-h-rotate-<number>` | Rotates hue by `<number>` degrees. Accepts named relational hues (`ak-layer-h-rotate-complementary`).                                |

### Chroma (saturation) adjustments

| Utility                        | Description                                                                                                                                             |
| ------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `ak-layer-saturate-<number>`   | Increases chroma by `<number>`%.                                                                                                                        |
| `ak-layer-desaturate-<number>` | Decreases chroma by `<number>`%.                                                                                                                        |
| `ak-layer-c-<value>`           | Sets absolute chroma. Accepts a percentage, named preset, or raw value.                                                                                 |
| `ak-layer-max-c-<value>`       | Caps chroma (percentage, named preset, or raw value).                                                                                                   |
| `ak-layer-min-c-<value>`       | Floors chroma, same form.                                                                                                                               |
| `ak-layer-max-c-auto`          | Automatically caps chroma based on layer lightness. Peaks at the mid-luminance threshold and tapers toward extremes so colors stay within the P3 gamut. |

### Mixing with another color

| Utility                 | Description                                                                                                                          |
| ----------------------- | ------------------------------------------------------------------------------------------------------------------------------------ |
| `ak-layer-mix`          | Enables mixing. By default, mixes with the parent layer at `50%` using the `oklab` interpolation method.                             |
| `ak-layer-mix-<color>`  | Sets the color to mix with, e.g. `ak-layer-mix-primary` or `ak-layer-mix-[#000]`.                                                    |
| `ak-layer-mix-<number>` | Sets the mix amount (`0`–`100`).                                                                                                     |
| `ak-layer-mix-<method>` | Sets the interpolation method, e.g. `ak-layer-mix-oklch`, `ak-layer-mix-shorter-hue`, `ak-layer-mix-srgb`. See the `--mix-*` tokens. |

Combine freely — `ak-layer ak-layer-primary ak-layer-mix ak-layer-mix-30 ak-layer-mix-oklch` mixes the primary color 30% into the parent layer using OKLCH.

## `ak-state`

`ak-state-*` utilities are companions to `ak-layer-*` that target interactive states (hover, active, focus). They shift lightness, chroma, and hue _without_ recomputing descendant text contrast, so state changes feel instant without layout jitter.

```html
<button class="ak-layer ak-layer-primary hover:ak-state-10 active:ak-state-20">
  Primary action
</button>
```

| Utility                        | Description                                                                           |
| ------------------------------ | ------------------------------------------------------------------------------------- |
| `ak-state-<number>`            | Adjusts lightness for interactive state (`0`–`100`), parallel to `ak-layer-<number>`. |
| `ak-state-lighten-<number>`    | Lightens in state context.                                                            |
| `ak-state-darken-<number>`     | Darkens in state context.                                                             |
| `ak-state-saturate-<number>`   | Increases chroma in state context.                                                    |
| `ak-state-desaturate-<number>` | Decreases chroma in state context.                                                    |
| `ak-state-push-<number>`       | Minimum lightness shift in state context.                                             |
| `ak-state-h-rotate-<number>`   | Rotates hue in state context.                                                         |

## `ak-ink`

Controls the opacity of text inside a layer — useful for secondary text, captions, and disabled states. It only sets text color, so it works either on the same element as [`ak-layer`](#ak-layer) (styling the layer's own text) or on a descendant element.

```html
<div class="ak-layer ak-layer-canvas ak-ink-70">
  Layer with its own text at 70% opacity
  <p class="ak-ink-0">Nested text at minimum readable opacity</p>
</div>
```

| Utility           | Description                                                                                                                                                          |
| ----------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `ak-ink-<number>` | Sets text opacity as an **absolute** alpha value (`0`–`100`). `0` clamps to the minimum alpha that still meets WCAG AA for the current layer; `100` is fully opaque. |

## `ak-text`

`ak-text` colors inline text with automatic contrast against the parent layer.

> **Apply `ak-text` to a descendant, not to the layer element itself.** It forces `background-color: transparent` to let the layer show through, which would erase the surface if placed on the `ak-layer` element. For styling the layer's own text color, use [`ak-ink`](#ak-ink) instead.

```html
<div class="ak-layer ak-layer-canvas">
  <span class="ak-text ak-text-primary">Primary text</span>
  <span class="ak-text ak-text-blue ak-text-vivid">Vivid blue text</span>
</div>
```

### Setting the text color

| Utility            | Description                                                                        |
| ------------------ | ---------------------------------------------------------------------------------- |
| `ak-text`          | Required base class for colored text.                                              |
| `ak-text-<color>`  | Applies a color with automatic contrast, e.g. `ak-text-primary`, `ak-text-[#c33]`. |
| `ak-text-<number>` | Pushes lightness away from the parent layer beyond the automatic readable floor.   |
| `ak-text-<chroma>` | Sets chroma from a named preset (`ak-text-vivid`).                                 |
| `ak-text-<hue>`    | Sets hue from a named preset (`ak-text-blue`).                                     |

### Adjustments

| Utility                       | Description                     |
| ----------------------------- | ------------------------------- |
| `ak-text-lighten-<number>`    | Lightens the text color.        |
| `ak-text-darken-<number>`     | Darkens the text color.         |
| `ak-text-saturate-<number>`   | Increases chroma.               |
| `ak-text-desaturate-<number>` | Decreases chroma.               |
| `ak-text-warm-<number>`       | Shifts hue toward `--hue-warm`. |
| `ak-text-cool-<number>`       | Shifts hue toward `--hue-cool`. |

### Channels and bounds

| Utility                     | Description                                                         |
| --------------------------- | ------------------------------------------------------------------- |
| `ak-text-l-<value>`         | Absolute lightness (percentage, `[value]`, or raw OKLCH lightness). |
| `ak-text-c-<value>`         | Absolute chroma (percentage, named preset, or `[value]`).           |
| `ak-text-h-<value>`         | Absolute hue (named, degrees, or `[value]`).                        |
| `ak-text-h-rotate-<number>` | Rotates hue by degrees.                                             |
| `ak-text-max-<value>`       | Caps lightness, or caps chroma when given a named chroma preset.    |
| `ak-text-min-<value>`       | Floors lightness or chroma, same form.                              |
| `ak-text-max-c-<value>`     | Caps chroma specifically.                                           |
| `ak-text-min-c-<value>`     | Floors chroma specifically.                                         |

## `ak-edge`

`ak-edge` controls border, ring, and shadow colors for any element inside an [`ak-layer`](#ak-layer). Useful for giving borders their own hue, saturation, or opacity without affecting the surface.

```html
<div class="ak-layer ak-frame ak-frame-border ak-edge-10">10% edge opacity</div>
<div class="ak-layer ak-frame ak-frame-border ak-edge-primary ak-edge-40">
  Primary border at 40%
</div>
```

### Setting the edge color

| Utility            | Description                                                                              |
| ------------------ | ---------------------------------------------------------------------------------------- |
| `ak-edge-<number>` | Sets edge alpha (`0`–`100`, default `10`).                                               |
| `ak-edge-<color>`  | Applies a specific edge color.                                                           |
| `ak-edge-<chroma>` | Sets chroma from a named preset.                                                         |
| `ak-edge-<hue>`    | Sets hue from a named preset.                                                            |
| `ak-edge-raw`      | Applies the color exactly as specified — shorthand for `ak-edge-100` + `ak-edge-push-0`. |

### Adjustments

| Utility                       | Description                                             |
| ----------------------------- | ------------------------------------------------------- |
| `ak-edge-lighten-<number>`    | Lightens the edge.                                      |
| `ak-edge-darken-<number>`     | Darkens the edge.                                       |
| `ak-edge-saturate-<number>`   | Increases chroma.                                       |
| `ak-edge-desaturate-<number>` | Decreases chroma.                                       |
| `ak-edge-warm-<number>`       | Shifts hue toward `--hue-warm`.                         |
| `ak-edge-cool-<number>`       | Shifts hue toward `--hue-cool`.                         |
| `ak-edge-push-<number>`       | Pushes edge lightness away from the layer for contrast. |

### Channels and bounds

| Utility                     | Description                 |
| --------------------------- | --------------------------- |
| `ak-edge-l-<value>`         | Absolute lightness.         |
| `ak-edge-c-<value>`         | Absolute chroma.            |
| `ak-edge-h-<value>`         | Absolute hue.               |
| `ak-edge-h-rotate-<number>` | Rotates hue by degrees.     |
| `ak-edge-max-<value>`       | Caps lightness or chroma.   |
| `ak-edge-min-<value>`       | Floors lightness or chroma. |
| `ak-edge-max-c-<value>`     | Caps chroma specifically.   |
| `ak-edge-min-c-<value>`     | Floors chroma specifically. |

## `ak-outline`

`ak-outline` sets an `outline-color` that adapts to the parent layer's contrast. Pair it with Tailwind's `outline-<width>` and `outline-offset-*` utilities for focus styles.

```html
<button
  class="ak-layer ak-outline ak-outline-primary outline-2 focus-visible:outline"
>
  Outlined button
</button>
```

### Setting the outline color

| Utility               | Description                             |
| --------------------- | --------------------------------------- |
| `ak-outline`          | Required base class.                    |
| `ak-outline-<color>`  | Applies a specific outline color.       |
| `ak-outline-<number>` | Adjusts contrast lightness (`0`–`100`). |
| `ak-outline-<chroma>` | Sets chroma from a named preset.        |
| `ak-outline-<hue>`    | Sets hue from a named preset.           |

### Adjustments

| Utility                          | Description                     |
| -------------------------------- | ------------------------------- |
| `ak-outline-lighten-<number>`    | Lightens the outline.           |
| `ak-outline-darken-<number>`     | Darkens the outline.            |
| `ak-outline-saturate-<number>`   | Increases chroma.               |
| `ak-outline-desaturate-<number>` | Decreases chroma.               |
| `ak-outline-warm-<number>`       | Shifts hue toward `--hue-warm`. |
| `ak-outline-cool-<number>`       | Shifts hue toward `--hue-cool`. |

### Channels and bounds

| Utility                        | Description                 |
| ------------------------------ | --------------------------- |
| `ak-outline-l-<value>`         | Absolute lightness.         |
| `ak-outline-c-<value>`         | Absolute chroma.            |
| `ak-outline-h-<value>`         | Absolute hue.               |
| `ak-outline-h-rotate-<number>` | Rotates hue by degrees.     |
| `ak-outline-max-<value>`       | Caps lightness or chroma.   |
| `ak-outline-min-<value>`       | Floors lightness or chroma. |
| `ak-outline-max-c-<value>`     | Caps chroma specifically.   |
| `ak-outline-min-c-<value>`     | Floors chroma specifically. |

## `ak-frame`

`ak-frame` defines border radius, padding, margin, borders, and layout flow **relative to the parent frame**. Nested frames automatically compute concentric radii that look correct regardless of the outermost container's size. When no parent frame exists, values are treated as absolute.

```html
<!-- radius 2xl, padding 1 -->
<div class="ak-frame ak-frame-2xl/1">
  <!-- nested child — radius adjusted to be concentric with the parent, padding 4 -->
  <div class="ak-frame ak-frame-2xl/4"></div>
</div>
```

> [!WARNING]
> Border widths affect radius math. Always use `ak-frame-border` instead of Tailwind's `border` utility so concentric radii stay correct:
>
> ```html
> <!-- ❌ — Tailwind border isn't factored into the radius calculation -->
> <div class="ak-frame ak-frame-xl/1 border">Border</div>
>
> <!-- ✅ -->
> <div class="ak-frame ak-frame-xl/1 ak-frame-border">Border</div>
> ```

### Setup

| Utility          | Description                                                                        |
| ---------------- | ---------------------------------------------------------------------------------- |
| `ak-frame`       | Required base class. Sets up the frame context for radius and padding inheritance. |
| `ak-frame-force` | Uses the declared radius exactly, ignoring parent-frame context.                   |

### Radius and padding

The shortcut form `ak-frame-<radius>/<padding>` sets both values at once. The part before `/` is a radius token (`--radius-*` or an arbitrary length), and the part after is a spacing token (`--spacing-*` or a number).

```html
<div class="ak-frame ak-frame-xl/4"></div>
<!-- rounded-xl, p-4 -->
<div class="ak-frame ak-frame-[1rem]/2"></div>
<!-- r 1rem, p-2 -->
<div class="ak-frame ak-frame-container/container"></div>
<!-- --radius-container, --spacing-container -->
```

Frame presets make paired radius/spacing tokens ergonomic:

```css
@theme {
  --radius-card: var(--radius-xl);
  --spacing-card: --spacing(6);
}
```

```html
<div class="ak-frame ak-frame-card/card">Card</div>
```

| Utility                       | Description                                                                                                                                           |
| ----------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------- |
| `ak-frame-<radius>`           | Sets border radius only. Accepts any `--radius-*` token (e.g. `ak-frame-xl`, `ak-frame-2xl`, `ak-frame-full`) or arbitrary value (`ak-frame-[1rem]`). |
| `ak-frame-<radius>/<padding>` | Sets radius **and** padding. Padding accepts `--spacing-*` tokens or numeric values (`/4`).                                                           |
| `ak-frame-rounded-<radius>`   | Alias for radius-only.                                                                                                                                |
| `ak-frame-rounded-none`       | Sets radius to `0px`.                                                                                                                                 |
| `ak-frame-p-<spacing>`        | Padding only. Accepts `--spacing-*` tokens, numeric values, or arbitrary values.                                                                      |

### Margin

| Utility                 | Description                                                                                           |
| ----------------------- | ----------------------------------------------------------------------------------------------------- |
| `ak-frame-m-<spacing>`  | Frame margin. Affects concentric radius math so nested frames stay correctly rounded after an offset. |
| `-ak-frame-m-<spacing>` | Negative frame margin (e.g. `-ak-frame-m-2`).                                                         |

### Borders and rings

All three utilities accept no argument (defaults to `1px`), named widths (`0`, `1`, `2`, `4`, `8`), or arbitrary values (`[3px]`).

| Utility                                             | Description                                                                                                                                                                 |
| --------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `ak-frame-border` / `ak-frame-border-<width>`       | Applies a border whose width is factored into nested-frame radius calculations.                                                                                             |
| `ak-frame-ring` / `ak-frame-ring-<width>`           | Applies a ring with the same treatment. Rings draw outside the border-box without shifting layout.                                                                          |
| `ak-frame-bordering` / `ak-frame-bordering-<width>` | Adaptive edge: behaves as a border when the layer is lightening relative to its parent, and as a ring when darkening. Keeps surfaces visually separated regardless of mode. |

### Cover and flow

`ak-frame-cover` stretches an element past the parent's content box so the child's own content-box aligns with its parent. Useful for full-bleed images, toolbars, and embedded panels.

```html
<div class="ak-frame ak-frame-xl/4">
  <img src="hero.jpg" class="ak-frame ak-frame-cover ak-frame-start" />
  <p class="pt-4">Body that sits below the full-bleed hero.</p>
</div>
```

| Utility          | Description                                                                                 |
| ---------------- | ------------------------------------------------------------------------------------------- |
| `ak-frame-cover` | Stretches the element to fill the parent content box, collapsing shared borders/rings.      |
| `ak-frame-start` | Marks the element as the first child so `frame-cover` applies top/leading-edge rounding.    |
| `ak-frame-end`   | Marks the element as the last child so `frame-cover` applies bottom/trailing-edge rounding. |
| `ak-frame-row`   | Flags the frame as a horizontal flow (affects how `cover` / `start` / `end` compute edges). |
| `ak-frame-col`   | Flags the frame as a vertical flow.                                                         |

## Variants

Variants apply utilities conditionally based on the parent layer or user preference. Use them like any Tailwind variant: `ak-dark:ak-layer-darken-6`.

### Layer appearance

These variants are scoped to an `ak-layer` container and match based on the layer's computed lightness.

| Variant         | Matches when the parent layer is…    |
| --------------- | ------------------------------------ |
| `ak-dark`       | Dark (would render white-ish text).  |
| `ak-light`      | Light (would render black-ish text). |
| `ak-dark-high`  | The darkest tier.                    |
| `ak-dark-low`   | A dark mid-tier.                     |
| `ak-light-low`  | A light mid-tier.                    |
| `ak-light-high` | The lightest tier.                   |

```html
<div class="ak-layer ak-layer-canvas">
  <div class="ak-dark:ak-layer-darken-6 ak-light:ak-layer-lighten-6">
    Adapts to its parent layer's appearance.
  </div>

  <div class="ak-dark-high:ak-edge-20 ak-light-high:ak-edge-10">
    Stronger edges on the darkest surfaces.
  </div>
</div>
```

> `ak-dark` / `ak-light` and their band variants require a parent `ak-layer`. They're implemented as `@container` style queries, so they silently fail to match outside a layer rather than falling back to a default.

### Accessibility

| Variant         | Matches when…                                                                                                                                                                            |
| --------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `contrast-more` | The user has requested higher contrast (`@media (prefers-contrast: more)`). Automatically sets `--contrast: 100`, which lifts lightness in every `ak-text`, `ak-edge`, and `ak-outline`. |

You can opt extra utilities into high-contrast mode with `contrast-more:`:

```html
<button class="ak-layer ak-frame ak-frame-ring contrast-more:ak-frame-border-2">
  Extra border weight in high-contrast mode.
</button>
```

## Migrating to v0.2

See [`migrating-to-v02.md`](./migrating-to-v02.md) for the full list of breaking changes from the v0.1 plugin.

## Core Team

- [Diego Haz](https://bsky.app/profile/haz.dev)
- [Ben Rodri](https://bsky.app/profile/ben.ariakit.org)
- [Dani Guardiola](https://bsky.app/profile/dio.la)

## Contributing

Follow the instructions on the [contributing guide](https://github.com/ariakit/ariakit/blob/main/contributing.md).
