# Ariakit Tailwind

**Important:** This package is experimental and does not follow semantic versioning, meaning breaking changes may occur in patch and minor versions.

Ariakit Tailwind is a Tailwind CSS v4 plugin that brings Ariakit Styles to your projects. It enables developers to build accessible design systems with **relative colors and radii** instead of fixed values, giving end users full freedom to customize the theme without sacrificing visual consistency. Swap a brand color, radius, or spacing scale, and every derived surface, text, and border rebalances itself automatically.

Ariakit Tailwind is framework and library agnostic. It works with any frontend framework (React, Vue, Svelte, Astro, …) and any component library (Ariakit React, Radix UI, React Aria, …).

## Contents

- [Quick start](#quick-start)
- [Theming](#theming)
- [Mental model](#mental-model)
- [`ak-layer`](#ak-layer): background, text, and border colors for a surface
- [`ak-state-*`](#ak-state): interactive state adjustments
- [`ak-ink`](#ak-ink): text opacity inside a layer
- [`ak-text`](#ak-text): colored text with automatic contrast
- [`ak-edge`](#ak-edge): border and ring colors
- [`ak-outline`](#ak-outline): outline colors
- [`ak-frame`](#ak-frame): radius, padding, margin, borders, and layout
- [Variants](#variants)
- [Migrating to v0.2](#migrating-to-v02)

## Quick start

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

   These root colors establish one application canvas. The [theming](#theming) section replaces them with a semantic canvas token, and the [mental model](#mental-model) explains how to choose descendant surfaces.

## Theming

Ariakit Tailwind integrates directly with Tailwind's theming system. Every `--color-*`, `--radius-*`, and `--spacing-*` token in your `@theme` block becomes available to the matching Ariakit utilities.

```css
@theme {
  --spacing-px: 1px;

  --color-canvas: #f5f8f7;
  --color-primary: #2563eb;
  --color-warning: #d97706;

  --radius-card: var(--radius-2xl);
  --spacing-card: --spacing(4);

  --radius-field: var(--radius-xl);
  --spacing-field: --spacing(2);

  --radius-dialog: var(--radius-3xl);
  --spacing-dialog: --spacing(6);

  --radius-badge: calc(infinity * 1px);
  --spacing-badge: --spacing(1.5);
}

:root {
  color-scheme: light;

  @variant dark {
    --color-canvas: #0b1110;
    color-scheme: dark;
  }
}
```

Matching radius and spacing names produce semantic frame shortcuts. For example, `ak-frame-card/card` uses `--radius-card` and `--spacing-card`. The `--spacing-px` token enables compact frame padding such as `ak-frame-field/px`.

This setup follows Tailwind's `dark` variant. For a manual theme toggle, configure that variant to match your root selector or override `--color-canvas` and `color-scheme` on the selector directly.

Use the custom canvas instead of repeating absolute colors:

<!-- prettier-ignore -->
```diff
- <body class="ak-layer ak-layer-white dark:ak-layer-gray-950">
+ <body class="ak-layer ak-layer-canvas">
```

### Advanced theme tokens

Ariakit Tailwind exposes additional tokens beyond `--color-*`, `--radius-*`, and `--spacing-*`:

| Token family | Purpose                                                                                                                                                                                                    | Defaults                                                                                                                                                                                                                                                                                                                                            |
| ------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `--contrast` | Global contrast preference (`0`–`100`). Utilities like `ak-text` push lightness farther from the layer as `--contrast` grows. Automatically set to `100` by the [`contrast-more`](#accessibility) variant. | `0`                                                                                                                                                                                                                                                                                                                                                 |
| `--chroma-*` | Named chroma presets for `ak-layer-*`, `ak-text-*`, `ak-edge-*`, `ak-outline-*`, and all `-c-*` / `-max-c-*` / `-min-c-*` utilities.                                                                       | `grayscale` (0), `muted` (0.05), `balanced` (0.15), `vivid` (0.22), `neon` (0.32)                                                                                                                                                                                                                                                                   |
| `--hue-*`    | Named hue presets (OKLCH degrees) for `-<hue>` / `-h-*` utilities.                                                                                                                                         | Absolute: `red`, `orange`, `yellow`, `green`, `cyan`, `blue`, `magenta`. Relational (relative to current hue): `complementary`, `split1`/`split2`, `analogous1`/`analogous2`, `triadic1`/`triadic2`, `tetradic1`/`tetradic2`/`tetradic3`, `square1`/`square2`/`square3`. `--hue-warm` and `--hue-cool` are used by `-warm-*` / `-cool-*` utilities. |
| `--mix-*`    | Named `color-mix()` interpolation methods used by `ak-layer-mix-*`.                                                                                                                                        | Every CSS color-mix method, e.g. `oklab`, `oklch`, `lab`, `lch`, `hsl`, `hwb`, `srgb`, `srgb-linear`, `display-p3`, `rec2020`, etc. Hyphen-separated forms like `oklch-shorter-hue` are available via `ak-layer-mix-oklch-shorter-hue`.                                                                                                             |

Override any of these in your own `@theme` block:

```css
@theme {
  --contrast: 50;
  --chroma-balanced: 0.18;
  --hue-brand: 250;
  --hue-warm: var(--hue-orange);
}
```

## Mental model

Think in materials, not elements. Ariakit Tailwind models a small tree of intentional surfaces and the content, boundaries, and shapes that belong to them. This material tree is usually much smaller than the DOM tree.

This does not imply skeuomorphic decoration. A flat interface still needs a coherent answer to what lies on the same plane, what sits above it, what is recessed into it, and what has a different material or semantic finish. Tone, containment, edges, and shape communicate those relationships even when there are no realistic textures or shadows.

### Think about the whole scene

Start with one canvas for the application. Then add a layer only when an element represents a visible surface with a purpose. Layout containers, headers, rows, text wrappers, and spacing elements should usually inherit the nearest surface.

Every `ak-layer` paints a background and establishes the text, edge, and contrast context inherited by its descendants. Adding one at every level turns DOM nesting into a tonal staircase:

```html
<!-- Avoid: none of these nested layers has a distinct material purpose. -->
<article class="ak-layer ak-layer-3">
  <header class="ak-layer ak-layer-3">
    <h2 class="ak-layer ak-layer-3">Deployment</h2>
  </header>
</article>
```

A more intentional scene uses one raised card, keeps its ordinary content on the card, and creates a new layer only for the recessed well:

```html
<body class="ak-layer ak-layer-canvas">
  <main class="p-6">
    <article
      class="ak-layer ak-layer-lighten-6 ak-frame ak-frame-card/card ak-frame-bordering grid gap-4"
    >
      <header class="grid gap-1">
        <h2>Deployment</h2>
        <p class="ak-ink-70">Updated two minutes ago</p>
      </header>

      <section
        class="ak-layer ak-layer-darken-3 ak-frame ak-frame-field/field ak-frame-bordering"
      >
        Recessed deployment details
      </section>
    </article>
  </main>
</body>
```

The `body`, card, and well are materials. The `main`, `header`, heading, and paragraph are structure or content on those materials, so they do not need layers.

### Give every surface a spatial role

In ordinary lighting, an exposed surface catches more light while a cutout or well receives less. Ariakit expresses that directional relationship directly, and the same intent holds on light and dark canvases:

| Intent                      | Visual role                                                                                                   | Utilities                                                                                 |
| --------------------------- | ------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------- |
| Same plane                  | Content or layout that belongs to the current material                                                        | No new `ak-layer`                                                                         |
| Raised or exposed           | Card, popover, floating toolbar, or control above its support                                                 | `ak-layer ak-layer-lighten-*`                                                             |
| Recessed                    | Well, track, code area, media bed, input bed, or pressed region                                               | `ak-layer ak-layer-darken-*`                                                              |
| Appearance-aware separation | Selected row, adjacent pane, or neutral standalone button that should remain visibly separate in either theme | `ak-layer ak-layer-*`                                                                     |
| New material or pigment     | Canvas, primary action, warning, brand region, or another intentional color boundary                          | `ak-layer ak-layer-<color>`, optionally with `ak-layer-mix-*`                             |
| Interactive response        | The same material responding to hover, press, focus, selection, or disabled state                             | Variant-prefixed `ak-state-*`, `ak-ink-*`, `ak-outline-*`, and other contextual modifiers |
| Parent-directed contrast    | A neutral or pigmented surface whose lightness must move against its supporting layer                         | `ak-layer ak-layer-contrast`, optionally with `ak-layer-<color>`                          |
| Self-relative tonal push    | A surface that needs a minimum tonal move and must skip the ambiguous midrange                                | `ak-layer-push-*`                                                                         |

Numeric `ak-layer-<number>` modifiers are not elevation values. They request appearance-aware separation from the selected source, which defaults to the parent layer. They normally move light sources darker and dark sources lighter, but the contrast-safe lightness pipeline may clamp the target or move it past an ambiguous midrange. Use them to separate a surface without declaring that it is above or below, and use `ak-layer-lighten-*` or `ak-layer-darken-*` when spatial direction matters.

A neutral standalone button can use this material when its affordance should remain visible at rest. Use it selectively: buttons inside a toolbar or another shared surface can stay on that plane and rely on state or ink changes for interaction.

Relative adjustments accumulate. Repeating them through wrappers creates competing boxes and can exhaust the useful tonal range. A practical test for every layer is: "Why is this a different material?" If the answer is only "because this element is nested," remove it.

Interactive states usually change the existing material instead of creating another nested surface. For routine hover feedback, prefer an appearance-aware tonal response so it remains perceptible when the component moves between light and dark scenes. Use a fixed lighten or darken direction only when that direction carries meaning, such as a pressed surface moving inward:

```html
<button
  class="ak-layer ak-layer-6 hover:ak-state-6 active:ak-state-darken-6 ak-frame ak-frame-field/field focus-visible:ak-outline focus-visible:ak-outline-primary focus-visible:outline-2"
>
  Save
</button>
```

The button has its own neutral material because it needs to stand out from nearby content. Hover moves its tone in the useful direction for the current theme, while pressing intentionally darkens it. Its focus outline is an external signal, not another material.

### Treat color as a material finish

Lightness usually communicates spatial relationship. Hue, chroma, warmth, and mixing describe the material's pigment, atmosphere, or semantic identity. Changing hue at every nesting level does not create meaningful depth, but keeping every material neutral can hide meaning that should be recognizable at a glance.

Treat hue as information. Keep most of the scene in one family, then spend stronger colors where identity, status, or priority should survive scanning before someone reads the label. A primary action can carry a concentrated brand color, while a status badge can use a lighter tint of its semantic color so it still belongs to the surrounding scene:

```html
<div class="flex items-center gap-2">
  <button
    class="ak-layer ak-layer-primary ak-layer-contrast hover:ak-state-6 active:ak-state-darken-6 ak-frame ak-frame-field/field focus-visible:ak-outline focus-visible:ak-outline-primary focus-visible:outline-2"
  >
    Deploy now
  </button>

  <span
    class="ak-layer ak-layer-warning ak-layer-mix-15 ak-frame ak-frame-badge/badge"
  >
    <span class="ak-text ak-text-warning ak-text-25">Needs review</span>
  </span>
</div>
```

A finish can be fixed or contextual. The primary action keeps one recognizable pigment but lets its tone move away from its support when needed. The default parent-directed contrast amount is usually a useful starting point, but it does not guarantee a particular contrast ratio. The badge softens its warning pigment into the surrounding material.

When belonging to the local material matters more than preserving one global swatch, derive the finish from the parent:

```html
<div class="ak-layer ak-layer-primary ak-frame ak-frame-card/card">
  <span
    class="ak-layer ak-layer-6 ak-layer-h-analogous1 ak-layer-c-muted ak-frame ak-frame-badge/badge"
  >
    Related material
  </span>
</div>
```

The child selects an analogous hue, a quieter chroma, and appearance-aware tonal separation from its parent. Complementary, analogous, and triadic hue tokens express other color relationships. Hue changes the pigment family, chroma changes its intensity, and lightness changes its tonal plane. A hue difference can be meaningful without implying depth, but it does not replace tonal separation or an edge when the boundary itself must remain perceivable.

These materials do not need borders when pigment, tone, and shape already separate them from the canvas. Mixing creates a contextual solid color, not transparency and not another depth level.

Custom gradients, patterns, and textures are also surface paint. Derive them from the resolved layer variables so the visible pixels stay related to the contrast context. Define repeated paint as a reusable Tailwind utility:

```html
<div
  class="surface-pattern ak-layer ak-layer-lighten-6 ak-frame ak-frame-card/card"
>
  ...
</div>
```

```css
@utility surface-pattern {
  --surface-pattern-color: color-mix(
    in oklab,
    var(--ak-layer),
    var(--ak-layer-parent, canvas) 35%
  );
  background-image: linear-gradient(
    135deg,
    var(--surface-pattern-color) 1px,
    transparent 1px
  );
  background-size: 0.75rem 0.75rem;
}
```

A top-level layer has no resolved parent custom property, so the `canvas` fallback keeps its pattern valid. Nested layers still mix with their actual parent.

A custom image or multistop gradient can still vary independently across the surface, so inspect text contrast against its actual pixels.

### Put content and boundaries on the material

The other utility families describe what belongs to a surface rather than creating more surfaces:

| Feature                       | Material role                                                                       |
| ----------------------------- | ----------------------------------------------------------------------------------- |
| Normal text                   | Inherits the layer's default ink                                                    |
| [`ak-ink-*`](#ak-ink)         | Changes the strength of neutral writing while preserving a readable contrast floor  |
| [`ak-text-*`](#ak-text)       | Applies adaptive colored pigment to a descendant inside a layer                     |
| [`ak-edge-*`](#ak-edge)       | Configures the seam between the current material and its surroundings               |
| [`ak-outline-*`](#ak-outline) | Draws an external focus or attention signal                                         |
| [`ak-frame-*`](#ak-frame)     | Defines the material's silhouette, inset, border thickness, and concentric geometry |
| [`ak-state-*`](#ak-state)     | Changes the current material temporarily in response to interaction                 |

Static utilities activate their context, while modifiers configure it. Pair `ak-layer-*`, `ak-state-*`, and `ak-edge-*` with `ak-layer` on the same element; pair `ak-text-*` with `ak-text` on the same descendant; pair `ak-frame-*` with `ak-frame`; and pair `ak-outline-*` with `ak-outline`. `ak-ink-*` is self-contained.

Color channel utilities are authored in [OKLCH](https://developer.mozilla.org/en-US/docs/Web/CSS/color_value/oklch), so modifiers like `ak-layer-warm-40` or `ak-text-saturate-50` behave predictably across hues. Text contrast is converted to LCH at the final contrast step, and layer mixing can use any supported CSS `color-mix()` interpolation method. Because values are computed relatively, changing one theme token ripples through every material role that depends on it.

Normal text needs no utility. Use `ak-ink-*` for hierarchy and `ak-text` on a descendant when text needs its own adaptive color:

```html
<article class="ak-layer ak-layer-lighten-6 ak-frame ak-frame-card/card">
  <h2>Build complete</h2>
  <p class="ak-ink-70">Finished three minutes ago</p>
  <a class="ak-text ak-text-primary" href="/builds/1284">View build 1284</a>
</article>
```

Do not put `ak-text` on the `ak-layer` element itself. It makes its own background transparent so the ancestor layer can show through.

### Let groups share a material

An edge is a seam between materials, not decoration for every control. Add one when an isolated control needs a clearer affordance or two neighboring materials would otherwise merge. When a toolbar reads as one instrument, let the group own the surface and seam while its buttons share that material:

```html
<div
  role="toolbar"
  aria-label="Formatting"
  class="ak-layer ak-layer-lighten-6 ak-frame ak-frame-field/0.5 ak-frame-bordering inline-flex gap-0.5"
>
  <button
    type="button"
    class="ak-frame ak-frame-field/0.5 border-0 bg-transparent ak-ink-70 hover:ak-ink-100"
  >
    <span class="block px-3 py-1.5">Bold</span>
  </button>
  <button
    type="button"
    class="ak-frame ak-frame-field/0.5 border-0 bg-transparent ak-ink-70 hover:ak-ink-100"
  >
    <span class="block px-3 py-1.5">Italic</span>
  </button>
  <button
    type="button"
    class="ak-frame ak-frame-field/0.5 border-0 bg-transparent ak-ink-70 hover:ak-ink-100"
  >
    <span class="block px-3 py-1.5">Link</span>
  </button>
</div>
```

Repeating a border or ring on every button would fragment the toolbar into unrelated boxes. `ak-frame-bordering` works on the group because its surface has an explicit lighten relationship. With an appearance-aware numeric `ak-layer-*`, choose a fixed `ak-frame-border` or `ak-frame-ring` instead.

Frame padding describes the thickness between a material's silhouette and its contents or a nested surface. A generous inset makes one surface feel contained inside another. A hairline or half-step inset makes adjacent pieces feel cut from the same control, which can make a selected segment sit precisely inside a recessed track:

```html
<div
  role="group"
  aria-label="Period"
  class="ak-layer ak-layer-darken-3 ak-frame ak-frame-field/px inline-flex"
>
  <button
    type="button"
    aria-pressed="false"
    class="ak-frame ak-frame-field/0.5 border-0 bg-transparent"
  >
    <span class="block px-3 py-1.5">Day</span>
  </button>
  <button
    type="button"
    aria-pressed="true"
    class="ak-layer ak-layer-lighten-6 ak-frame ak-frame-field/0.5 border-0"
  >
    <span class="block px-3 py-1.5">Week</span>
  </button>
  <button
    type="button"
    aria-pressed="false"
    class="ak-frame ak-frame-field/0.5 border-0 bg-transparent"
  >
    <span class="block px-3 py-1.5">Month</span>
  </button>
</div>
```

The one-pixel track inset and half-step child insets create a crisp nested silhouette, while the inner spans preserve comfortable hit areas. The track and selected segment are the only distinct materials.

### Give isolated components their own shape

Every isolated card, control, popover, dialog, and badge should declare a non-zero radius by default. An isolated `ak-frame` has a zero declared radius until a radius modifier is applied, while a nested frame may derive an effective concentric radius from its parent. Define semantic radius and padding pairs in the [theme](#theming), then select them in component recipes:

```html
<article class="ak-layer ak-layer-lighten-6 ak-frame ak-frame-card/card">
  ...
</article>
<button class="ak-layer ak-layer-primary ak-frame ak-frame-field/field">
  Primary action
</button>
<div class="ak-layer ak-layer-lighten-6 ak-frame ak-frame-dialog/dialog">
  Dialog
</div>
<span
  class="ak-layer ak-layer-warning ak-layer-mix-15 ak-frame ak-frame-badge/badge"
>
  Badge
</span>
```

These recipes own their shapes even when rendered without a parent frame. When frames are nested, Ariakit reconciles their effective radii with the parent's radius, padding, and border plus the child's frame margin so nearby corners remain concentric.

A square visual language is a theme decision. Override the shared radius tokens once instead of putting `ak-frame-rounded-none` in every component recipe:

```css
:root[data-shape="square"] {
  --radius-card: 0px;
  --radius-field: 0px;
  --radius-dialog: 0px;
  --radius-badge: 0px;
}
```

Local square corners are still appropriate when geometry is intentionally attached or flush, such as a viewport sidebar or an internal segment of a composite control. Use `ak-frame ak-frame-force ak-frame-rounded-none` when that local shape must be exactly square. Let `ak-frame-cover`, `ak-frame-start`, and `ak-frame-end` compute any corners that meet the parent's outer silhouette.

Frame padding and borders participate in concentric geometry. Use `ak-frame-p-*`, the combined `ak-frame-<radius>/<padding>` form, and `ak-frame-border`, `ak-frame-ring`, or `ak-frame-bordering` for the symmetric chrome that shapes a component and stays concentric with its nested frames. Do not replace that chrome wholesale with a full `p-*` override or Tailwind's full `border`, and put large asymmetric layout spacing on an inner wrapper instead.

Axis-specific spacing and seams are a different case, and Tailwind's built-in utilities are the right tool for them. A button commonly needs more horizontal than vertical padding, and a raised header bar commonly uses a bottom border as its seam to the content below. Reach for `px-*` or `py-*` (not the full `p-*`) and side-specific borders such as `border-b`, `border-t`, or `border-x` (not the full `border`) in those cases:

```html
<!-- More horizontal than vertical padding on a control -->
<button class="ak-layer ak-layer-primary ak-frame ak-frame-field/field px-6">
  Wide button
</button>

<!-- A raised header bar whose seam to the content below is a bottom edge -->
<header class="ak-layer ak-layer-lighten-6 border-b px-6 py-4">
  Page header
</header>
```

These axis values are not folded into the concentric radius math, and that is exactly what you want here: the extra horizontal padding and the single-side seam do not describe a rounded corner that a nested frame must stay concentric with, so leaving them out keeps the silhouette correct while still giving you the spacing or separator you asked for. Each example still earns its `ak-layer` as a real material, the raised bar rather than a wrapper added only to color a border, and that layer is what lets the `border-b` pick up the adaptive edge color.

### Read utility values

Bare numeric modifiers use Ariakit's documented authoring scales. For example, lightness and alpha values use `0`–`100`, chroma values use `0`–`40`, and mix amounts use `0`–`100`.

Arbitrary values and custom properties are raw CSS values. Percent-style modifiers use normalized `0`–`1` values in arbitrary or custom-property form, even when their bare numeric forms use Ariakit's `0`–`100` or `0`–`40` authoring scales. Use normalized OKLCH channel values like `ak-layer-l-[0.8]`, normalized percent-style values like `ak-layer-warm-[0.4]` or `ak-text-saturate-[0.25]`, raw deltas like `ak-layer-[calc(l+0.1)]`, percentages where CSS expects them like `ak-layer-mix-amount-[35%]`, and custom properties that already contain those raw values.

### Judge the whole scene

Accessibility math protects contrast, not taste. Before shipping, inspect the complete scene and ask:

- Can every layer be described as the canvas, raised, recessed, appearance-aware separation, semantic material, or interactive material?
- Does removing any layer make the hierarchy clearer?
- Do raised and recessed relationships remain coherent when only the canvas changes between light and dark?
- Do hue choices make identity, status, and priority easier to scan without turning every surface into an accent?
- Do hover, active, selected, focus, and disabled states change the existing material with a clear purpose?
- Can a group own one surface and seam instead of bordering every control?
- Would a hairline or half-step frame inset describe a nested relationship better than another roomy box?
- Do isolated component recipes remain intentionally rounded, and can a square theme be achieved by changing shared tokens only?
- Do nested corners and adaptive edges describe the intended material boundaries?
- Does the composition remain coherent in [`contrast-more`](#accessibility), inside another semantic layer, and across supported browsers?

Package contributors should use the existing light, dark, and high-contrast computed-style snapshot matrix. That sandbox deliberately exercises many utilities at once and is a behavior test, not an aesthetic example.

---

## `ak-layer`

Layers are the foundation of Ariakit Styles. Every element with `ak-layer` is a surface with its own background, text, and edge colors, so only use it when the element represents an intentional material. Use `ak-layer-lighten-*` for raised surfaces, `ak-layer-darken-*` for recessed surfaces, and numeric `ak-layer-*` modifiers for appearance-aware separation that does not imply a fixed depth direction.

```html
<body class="ak-layer ak-layer-canvas">
  <article class="ak-layer ak-layer-lighten-6 ak-frame ak-frame-card/card">
    Raised card
  </article>
  <div class="ak-layer ak-layer-darken-3 ak-frame ak-frame-field/field">
    Recessed well
  </div>
  <button class="ak-layer ak-layer-6 ak-frame ak-frame-field/field">
    Appearance-aware control
  </button>
</body>
```

A layer automatically sets border and ring colors through the shared `--ak-edge` color. Use [`ak-frame-border`](#ak-frame) or [`ak-frame-ring`](#ak-frame) to display them:

```html
<div class="ak-layer ak-frame ak-frame-border">Border from ak-layer</div>
<div class="ak-layer ak-frame ak-frame-ring">Ring from ak-layer</div>
```

Use [`ak-edge`](#ak-edge) to fine-tune border and ring colors without touching the layer background.

Custom backgrounds can read the resolved `--ak-layer` color and `var(--ak-layer-parent, canvas)`. See [Treat color as a material finish](#treat-color-as-a-material-finish) for patterns that stay related to their contrast context.

### Setting the layer color

| Utility                   | Description                                                                                                                                                                                                                                                                                      |
| ------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `ak-layer`                | Required base class. Sets background, text, border, and ring colors.                                                                                                                                                                                                                             |
| `ak-layer-<color>`        | Sets the layer to a specific color. Accepts any theme color (e.g. `ak-layer-primary`, `ak-layer-blue-500`) or arbitrary value (`ak-layer-[#131418]`).                                                                                                                                            |
| `ak-layer-color-<color>`  | Explicit color-only alias. Useful for custom properties without a typed arbitrary value hint (`ak-layer-color-(--surface)`).                                                                                                                                                                     |
| `ak-layer-<number>`       | Applies an appearance-aware lightness offset relative to the selected source, which defaults to the parent layer (`0`–`100`). This provides separation rather than fixed elevation. Bare `ak-layer` doesn't shift lightness on its own. Arbitrary values are raw, e.g. `ak-layer-[calc(l+0.1)]`. |
| `ak-layer-offset-<value>` | Explicit lightness-offset alias for `ak-layer-<number>`. Useful for custom properties without a typed arbitrary value hint (`ak-layer-offset-(--depth)`). Arbitrary/custom-property values are raw.                                                                                              |
| `ak-layer-<chroma>`       | Sets chroma from a named preset, e.g. `ak-layer-vivid`, `ak-layer-muted`. See `--chroma-*` tokens.                                                                                                                                                                                               |
| `ak-layer-<hue>`          | Sets hue from a named preset, e.g. `ak-layer-red`, `ak-layer-blue`. See `--hue-*` tokens.                                                                                                                                                                                                        |

### Lightness adjustments

| Utility                      | Description                                                                                                                                                                                        |
| ---------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `ak-layer-lighten-<number>`  | Lightens the layer by `<number>`%, useful for intentionally raised or exposed surfaces. Arbitrary values are raw (`ak-layer-lighten-[0.05]`).                                                      |
| `ak-layer-darken-<number>`   | Darkens the layer by `<number>`%, useful for intentionally recessed or pressed surfaces. Arbitrary values are raw (`ak-layer-darken-[0.05]`).                                                      |
| `ak-layer-push-<number>`     | Minimum lightness shift (self-relative), jumping the forbidden mid-luminance range where contrast math becomes unreliable.                                                                         |
| `ak-layer-contrast`          | Applies a parent-directed tonal target (preset `25`), preserving hue and chroma. Lightness stays unchanged when it is already farther in that direction. This does not guarantee a contrast ratio. |
| `ak-layer-contrast-<number>` | Custom contrast amount (`0`–`100`, default `25`).                                                                                                                                                  |
| `ak-layer-l-<value>`         | Sets absolute lightness (`0`–`100` for bare numbers, raw `0`–`1` for arbitrary/custom-property values).                                                                                            |
| `ak-layer-max-<value>`       | Caps lightness (`0`–`100` for bare numbers, raw `0`–`1` for arbitrary/custom-property values) or caps chroma with a named chroma preset (`ak-layer-max-muted`).                                    |
| `ak-layer-min-<value>`       | Floors lightness or chroma, same form as `max-*`.                                                                                                                                                  |
| `ak-layer-max-l-<value>`     | Caps lightness specifically. Useful for custom properties without a typed arbitrary value hint (`ak-layer-max-l-(--max-l)`). Arbitrary/custom-property values are raw.                             |
| `ak-layer-min-l-<value>`     | Floors lightness specifically. Arbitrary/custom-property values are raw.                                                                                                                           |

### Hue adjustments

| Utility                      | Description                                                                                                                                                                   |
| ---------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `ak-layer-warm-<number>`     | Shifts hue toward `--hue-warm` by `<number>`%, along the shortest arc.                                                                                                        |
| `ak-layer-cool-<number>`     | Shifts hue toward `--hue-cool` by `<number>`%, along the shortest arc.                                                                                                        |
| `ak-layer-h-<value>`         | Sets hue from degrees or a named token. Relational presets such as `ak-layer-h-complementary`, `ak-layer-h-analogous1`, and `ak-layer-h-triadic1` derive from the source hue. |
| `ak-layer-h-rotate-<number>` | Rotates the source hue by numeric degrees, for example `ak-layer-h-rotate-30`.                                                                                                |

### Chroma (saturation) adjustments

| Utility                        | Description                                                                                                                                             |
| ------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `ak-layer-saturate-<number>`   | Increases chroma by `<number>`%.                                                                                                                        |
| `ak-layer-desaturate-<number>` | Decreases chroma by `<number>`%.                                                                                                                        |
| `ak-layer-c-<value>`           | Sets absolute chroma (`0`–`40` for bare numbers, raw OKLCH chroma for arbitrary/custom-property values) or a named preset.                              |
| `ak-layer-max-c-<value>`       | Caps chroma (`0`–`40` for bare numbers, raw OKLCH chroma for arbitrary/custom-property values) or a named preset.                                       |
| `ak-layer-min-c-<value>`       | Floors chroma, same form.                                                                                                                               |
| `ak-layer-max-c-auto`          | Automatically caps chroma based on layer lightness. Peaks at the mid-luminance threshold and tapers toward extremes so colors stay within the P3 gamut. |

### Mixing with another color

| Utility                        | Description                                                                                                                                                        |
| ------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `ak-layer-mix`                 | Enables mixing. By default, mixes with the parent layer at `50%` using the `oklab` interpolation method.                                                           |
| `ak-layer-mix-<color>`         | Enables mixing with a color, e.g. `ak-layer-mix-primary` or `ak-layer-mix-[#000]`.                                                                                 |
| `ak-layer-mix-color-<color>`   | Sets the mix color for `ak-layer-mix`. Useful for custom properties (`ak-layer-mix-color-(--mix-color)`).                                                          |
| `ak-layer-mix-<number>`        | Enables mixing and sets the mix amount (`0`–`100`).                                                                                                                |
| `ak-layer-mix-amount-<value>`  | Sets the amount for `ak-layer-mix`. Useful for custom properties (`ak-layer-mix-amount-(--mix-amount)`). Arbitrary/custom-property values are raw CSS percentages. |
| `ak-layer-mix-<method>`        | Sets the interpolation method, e.g. `ak-layer-mix-oklch`, `ak-layer-mix-oklch-shorter-hue`, `ak-layer-mix-srgb`. See the `--mix-*` tokens.                         |
| `ak-layer-mix-method-<method>` | Sets the interpolation method for `ak-layer-mix`. Useful for custom properties (`ak-layer-mix-method-(--mix-method)`).                                             |

Combine freely: `ak-layer ak-layer-primary ak-layer-mix-30 ak-layer-mix-oklch` mixes the primary color 30% into the parent layer using OKLCH.

The explicit `ak-layer-mix-color-*`, `ak-layer-mix-amount-*`, and `ak-layer-mix-method-*` longhands configure the mix color, amount, and method, but don't enable mixing by themselves. Pair them with `ak-layer-mix` when setting any of these values independently.

## `ak-state`

`ak-state-*` utilities are companions to `ak-layer-*` that target interactive states (hover, active, focus). They shift the state layer's lightness, chroma, and hue separately from the idle layer setup. Descendant text and edges still respond to the resulting layer color.

For routine hover feedback, prefer appearance-aware numeric `ak-state-*`. It chooses a useful lightness direction from the current material, so the response remains perceptible across light and dark scenes. Use `ak-state-lighten-*` or `ak-state-darken-*` when the direction itself is intentional.

The static `ak-layer` class must be applied to the same element as `ak-state-*`. Keep `ak-layer` unprefixed, then add state utilities with variants such as `hover:` or `active:`.

```html
<button
  class="ak-layer ak-layer-primary hover:ak-state-6 active:ak-state-darken-6 ak-frame ak-frame-field/field"
>
  Primary action
</button>
```

| Utility                        | Description                                                                                                                                                                                       |
| ------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `ak-state-<value>`             | Applies an appearance-aware lightness offset for interactive state (`0`–`100` for bare numbers), parallel to `ak-layer-<number>`. Custom properties can use `ak-state-(--depth)` with raw values. |
| `ak-state-offset-<value>`      | Explicit lightness-offset alias for `ak-state-<value>`. Useful for custom properties (`ak-state-offset-(--depth)`). Arbitrary/custom-property values are raw.                                     |
| `ak-state-lighten-<number>`    | Lightens in state context when that fixed direction is intentional.                                                                                                                               |
| `ak-state-darken-<number>`     | Darkens in state context when that fixed direction is intentional.                                                                                                                                |
| `ak-state-saturate-<number>`   | Increases chroma in state context.                                                                                                                                                                |
| `ak-state-desaturate-<number>` | Decreases chroma in state context.                                                                                                                                                                |
| `ak-state-push-<number>`       | Minimum lightness shift in state context.                                                                                                                                                         |
| `ak-state-h-rotate-<number>`   | Rotates hue in state context.                                                                                                                                                                     |

## `ak-ink`

Controls the opacity of text inside a layer, which is useful for secondary text, captions, and disabled states. It only sets text color, so it works either on the same element as [`ak-layer`](#ak-layer) (styling the layer's own text) or on a descendant element.

```html
<div class="ak-layer ak-layer-canvas ak-ink-70">
  Layer with its own text at least 70% opaque
  <p class="ak-ink-0">Nested text at minimum readable opacity</p>
</div>
```

| Utility           | Description                                                                                                                                                                                                                               |
| ----------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `ak-ink-<number>` | Requests a text alpha (`0`–`100`). The rendered alpha is the larger of the requested value and the minimum that still meets WCAG AA contrast against the current layer, so values below that floor are clamped up; `100` is fully opaque. |

## `ak-text`

`ak-text` colors inline text with automatic contrast against the parent layer.

> **Apply `ak-text` to a descendant, not to the layer element itself.** It forces `background-color: transparent` to let the layer show through, which would erase the surface if placed on the `ak-layer` element. For styling the layer's own text color, use [`ak-ink`](#ak-ink) instead.

Normal text should inherit the layer's text color without an extra utility. Use `ak-ink-*` for secondary or translucent text. Use `ak-text` on a descendant when the text needs its own adaptive color or additional contrast, and add `ak-text-<color>` when it needs a specific hue.

```html
<div class="ak-layer ak-layer-canvas">
  <span class="ak-text ak-text-primary">Primary text</span>
  <span class="ak-text ak-text-blue ak-text-vivid">Vivid blue text</span>
</div>
```

### Setting the text color

| Utility                 | Description                                                                                                                                             |
| ----------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `ak-text`               | Required base class for colored text.                                                                                                                   |
| `ak-text-<color>`       | Applies a color with automatic contrast, e.g. `ak-text-primary`, `ak-text-[#c33]`.                                                                      |
| `ak-text-color-<color>` | Explicit color-only alias. Useful for custom properties (`ak-text-color-(--text-color)`).                                                               |
| `ak-text-<number>`      | Pushes lightness away from the parent layer beyond the automatic readable floor.                                                                        |
| `ak-text-push-<value>`  | Explicit lightness-push alias for `ak-text-<number>`. Useful for custom properties (`ak-text-push-(--push)`). Arbitrary/custom-property values are raw. |
| `ak-text-<chroma>`      | Sets chroma from a named preset (`ak-text-vivid`).                                                                                                      |
| `ak-text-<hue>`         | Sets hue from a named preset (`ak-text-blue`).                                                                                                          |

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

| Utility                     | Description                                                                                                                                                                 |
| --------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `ak-text-l-<value>`         | Sets the candidate absolute lightness (`0`–`100` for bare numbers, raw `0`–`1` for arbitrary/custom-property values). Automatic contrast may adjust the rendered lightness. |
| `ak-text-c-<value>`         | Absolute chroma (`0`–`40` for bare numbers, raw OKLCH chroma for arbitrary/custom-property values) or a named preset.                                                       |
| `ak-text-h-<value>`         | Absolute hue. Accepts named hues or degrees, including custom properties.                                                                                                   |
| `ak-text-h-rotate-<number>` | Rotates hue by degrees.                                                                                                                                                     |
| `ak-text-max-<value>`       | Caps lightness, or caps chroma when given a named chroma preset.                                                                                                            |
| `ak-text-min-<value>`       | Floors lightness or chroma, same form.                                                                                                                                      |
| `ak-text-max-l-<value>`     | Caps lightness specifically. Arbitrary/custom-property values are raw.                                                                                                      |
| `ak-text-min-l-<value>`     | Floors lightness specifically. Arbitrary/custom-property values are raw.                                                                                                    |
| `ak-text-max-c-<value>`     | Caps chroma specifically. Arbitrary/custom-property values are raw.                                                                                                         |
| `ak-text-min-c-<value>`     | Floors chroma specifically. Arbitrary/custom-property values are raw.                                                                                                       |

## `ak-edge`

`ak-edge` controls border and ring colors for the element's own [`ak-layer`](#ak-layer). Useful for giving borders their own hue, saturation, or opacity without affecting the surface.

`ak-edge-*` utilities require the static `ak-layer` class on the same element so the edge color can resolve against that layer.

```html
<div class="ak-layer ak-frame ak-frame-border ak-edge-10">10% edge opacity</div>
<div class="ak-layer ak-frame ak-frame-border ak-edge-primary ak-edge-40">
  Primary border at 40%
</div>
```

### Setting the edge color

| Utility                 | Description                                                                                                                                                   |
| ----------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `ak-edge-<number>`      | Sets edge alpha (`0`–`100`, default `10`).                                                                                                                    |
| `ak-edge-alpha-<value>` | Explicit alpha alias for `ak-edge-<number>`. Useful for custom properties (`ak-edge-alpha-(--alpha)`). Arbitrary/custom-property values are raw alpha values. |
| `ak-edge-<color>`       | Applies a specific edge color.                                                                                                                                |
| `ak-edge-color-<color>` | Explicit color-only alias. Useful for custom properties (`ak-edge-color-(--edge-color)`).                                                                     |
| `ak-edge-<chroma>`      | Sets chroma from a named preset.                                                                                                                              |
| `ak-edge-<hue>`         | Sets hue from a named preset.                                                                                                                                 |
| `ak-edge-raw`           | Applies the color exactly as specified, a shorthand for `ak-edge-100` + `ak-edge-push-0`.                                                                     |
| `ak-edge-inherit`       | Uses the edge from the nearest ancestor that explicitly sets a frame border, ring, or bordering width; falls back to the current layer edge when none exists. |

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

| Utility                     | Description                                                                                                           |
| --------------------------- | --------------------------------------------------------------------------------------------------------------------- |
| `ak-edge-l-<value>`         | Absolute lightness (`0`–`100` for bare numbers, raw `0`–`1` for arbitrary/custom-property values).                    |
| `ak-edge-c-<value>`         | Absolute chroma (`0`–`40` for bare numbers, raw OKLCH chroma for arbitrary/custom-property values) or a named preset. |
| `ak-edge-h-<value>`         | Absolute hue. Accepts named hues or degrees, including custom properties.                                             |
| `ak-edge-h-rotate-<number>` | Rotates hue by degrees.                                                                                               |
| `ak-edge-max-<value>`       | Caps lightness or chroma.                                                                                             |
| `ak-edge-min-<value>`       | Floors lightness or chroma.                                                                                           |
| `ak-edge-max-l-<value>`     | Caps lightness specifically. Arbitrary/custom-property values are raw.                                                |
| `ak-edge-min-l-<value>`     | Floors lightness specifically. Arbitrary/custom-property values are raw.                                              |
| `ak-edge-max-c-<value>`     | Caps chroma specifically. Arbitrary/custom-property values are raw.                                                   |
| `ak-edge-min-c-<value>`     | Floors chroma specifically. Arbitrary/custom-property values are raw.                                                 |

## `ak-outline`

`ak-outline` sets an `outline-color` that pushes away from the parent layer's lightness. Pair it with Tailwind's `outline-<width>` and `outline-offset-*` utilities for focus styles.

```html
<button
  class="ak-layer ak-frame ak-frame-field/field ak-outline ak-outline-primary outline-2 focus-visible:outline"
>
  Outlined button
</button>
```

### Setting the outline color

| Utility                    | Description                                                                                                                                                   |
| -------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `ak-outline`               | Required base class.                                                                                                                                          |
| `ak-outline-<color>`       | Applies a specific outline color.                                                                                                                             |
| `ak-outline-color-<color>` | Explicit color-only alias. Useful for custom properties (`ak-outline-color-(--outline-color)`).                                                               |
| `ak-outline-<number>`      | Pushes outline lightness away from the parent layer (`0`–`100`).                                                                                              |
| `ak-outline-push-<value>`  | Explicit lightness-push alias for `ak-outline-<number>`. Useful for custom properties (`ak-outline-push-(--push)`). Arbitrary/custom-property values are raw. |
| `ak-outline-<chroma>`      | Sets chroma from a named preset.                                                                                                                              |
| `ak-outline-<hue>`         | Sets hue from a named preset.                                                                                                                                 |

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

| Utility                        | Description                                                                                                           |
| ------------------------------ | --------------------------------------------------------------------------------------------------------------------- |
| `ak-outline-l-<value>`         | Absolute lightness (`0`–`100` for bare numbers, raw `0`–`1` for arbitrary/custom-property values).                    |
| `ak-outline-c-<value>`         | Absolute chroma (`0`–`40` for bare numbers, raw OKLCH chroma for arbitrary/custom-property values) or a named preset. |
| `ak-outline-h-<value>`         | Absolute hue. Accepts named hues or degrees, including custom properties.                                             |
| `ak-outline-h-rotate-<number>` | Rotates hue by degrees.                                                                                               |
| `ak-outline-max-<value>`       | Caps lightness or chroma.                                                                                             |
| `ak-outline-min-<value>`       | Floors lightness or chroma.                                                                                           |
| `ak-outline-max-l-<value>`     | Caps lightness specifically. Arbitrary/custom-property values are raw.                                                |
| `ak-outline-min-l-<value>`     | Floors lightness specifically. Arbitrary/custom-property values are raw.                                              |
| `ak-outline-max-c-<value>`     | Caps chroma specifically. Arbitrary/custom-property values are raw.                                                   |
| `ak-outline-min-c-<value>`     | Floors chroma specifically. Arbitrary/custom-property values are raw.                                                 |

## `ak-frame`

`ak-frame` defines border radius, padding, margin, borders, and layout flow **relative to the parent frame**. Nested frames automatically compute concentric radii that look correct regardless of the outermost container's size. When no parent frame exists, values are treated as absolute.

See [Give isolated components their own shape](#give-isolated-components-their-own-shape) for choosing semantic radii, preserving default roundness, and implementing a square theme.

Use `ak-frame-p-*` or the combined `ak-frame-<radius>/<padding>` form when padding belongs to component chrome. This keeps padding, borders, and nested radii in the same geometry model.

```html
<!-- radius 2xl, padding 1 -->
<div class="ak-frame ak-frame-2xl/1">
  <!-- nested child, radius adjusted to be concentric with the parent, padding 4 -->
  <div class="ak-frame ak-frame-2xl/4"></div>
</div>
```

> [!WARNING]
> Border widths affect radius math. When a border defines the frame's rounded silhouette, always use `ak-frame-border` instead of Tailwind's `border` utility so concentric radii stay correct:
>
> ```html
> <!-- ❌: Tailwind border isn't factored into the radius calculation -->
> <div class="ak-frame ak-frame-xl/1 border">Border</div>
>
> <!-- ✅ -->
> <div class="ak-frame ak-frame-xl/1 ak-frame-border">Border</div>
> ```
>
> Side-specific borders used as a seam rather than the frame's silhouette, such as a `border-b` separator, are fine as plain Tailwind utilities. They intentionally stay out of the concentric radius math. See [Give isolated components their own shape](#give-isolated-components-their-own-shape).

### Setup

| Utility          | Description                                                                                                                                                                                                        |
| ---------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `ak-frame`       | Required base class. Sets up the frame context for radius and padding inheritance. An isolated frame declares zero radius until a radius modifier is applied, while a nested frame may derive a concentric radius. |
| `ak-frame-force` | Uses the declared radius exactly, ignoring parent-frame context.                                                                                                                                                   |

### Radius and padding

The shortcut form `ak-frame-<radius>/<padding>` sets both values at once. The part before `/` is a radius token (`--radius-*` or an arbitrary length), and the part after is a spacing token (`--spacing-*` or a number).

```html
<div class="ak-frame ak-frame-xl/4"></div>
<!-- rounded-xl, p-4 -->
<div class="ak-frame ak-frame-[1rem]/2"></div>
<!-- r 1rem, p-2 -->
<div class="ak-frame ak-frame-card/card"></div>
<!-- --radius-card, --spacing-card -->
```

Sharing a name between radius and spacing tokens lets one modifier set both values.

| Utility                       | Description                                                                                                                                                                |
| ----------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `ak-frame-<radius>`           | Sets border radius only. Accepts any defined `--radius-*` token (e.g. `ak-frame-xl`, `ak-frame-2xl`, or a custom `ak-frame-badge`) or arbitrary value (`ak-frame-[1rem]`). |
| `ak-frame-<radius>/<padding>` | Sets radius **and** padding. Padding accepts `--spacing-*` tokens or numeric values (`/4`).                                                                                |
| `ak-frame-rounded-<radius>`   | Alias for radius-only.                                                                                                                                                     |
| `ak-frame-rounded-none`       | Sets the declared radius to `0px`. Add `ak-frame-force` when a nested frame must remain exactly square.                                                                    |
| `ak-frame-p-<spacing>`        | Padding only. Accepts `--spacing-*` tokens, numeric values, or arbitrary values.                                                                                           |

### Margin

| Utility                 | Description                                                                                           |
| ----------------------- | ----------------------------------------------------------------------------------------------------- |
| `ak-frame-m-<spacing>`  | Frame margin. Affects concentric radius math so nested frames stay correctly rounded after an offset. |
| `-ak-frame-m-<spacing>` | Negative frame margin (e.g. `-ak-frame-m-2`).                                                         |

### Borders and rings

All three utilities accept no argument (defaults to `1px`), named widths (`0`, `1`, `2`, `4`, `8`), or arbitrary values (`[3px]`).

| Utility                                             | Description                                                                                                                                                                         |
| --------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `ak-frame-border` / `ak-frame-border-<width>`       | Applies a border whose width is factored into nested-frame radius calculations.                                                                                                     |
| `ak-frame-ring` / `ak-frame-ring-<width>`           | Applies a ring with the same treatment. Rings draw outside the border-box without shifting layout.                                                                                  |
| `ak-frame-bordering` / `ak-frame-bordering-<width>` | Adaptive edge: chooses a border or ring based on parent layer appearance and the layer's explicit lighten or darken relationship, keeping surfaces visually separated across modes. |
| `ak-frame-bordering-inherit`                        | Inherits the nearest ancestor frame border, ring, or bordering width, skipping intermediate frames that do not explicitly set one; falls back to `0px`.                             |

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
| `ak-frame-cover` | Stretches the element to fill the parent content box, collapsing shared borders.            |
| `ak-frame-start` | Marks the element as the first child so `frame-cover` applies top/leading-edge rounding.    |
| `ak-frame-end`   | Marks the element as the last child so `frame-cover` applies bottom/trailing-edge rounding. |
| `ak-frame-row`   | Flags the frame as a horizontal flow (affects how `cover` / `start` / `end` compute edges). |
| `ak-frame-col`   | Flags the frame as a vertical flow.                                                         |

`ak-frame-cover` uses logical margin and radius properties so row covers follow the frame direction. When overriding its stretch margin on the same element, prefer axis or side utilities such as `mx-*`, `my-*`, `ms-*`, `me-*`, `mt-*`, `mr-*`, `mb-*`, or `ml-*`; Tailwind sorts the bare `m-*` shorthand before the cover declarations, so it will not reset the logical stretch. Covers should also share the frame's `dir` and `writing-mode`; apply direction changes inside the cover when the content needs a different flow.

## Variants

Variants apply utilities conditionally based on the parent layer or user preference. Use them like any Tailwind variant: `ak-dark:ak-ink-80`.

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

Each layer appearance variant also has a `not-*` counterpart, such as
`not-ak-dark`, `not-ak-light`, and `not-ak-dark-high`.

```html
<div class="ak-layer ak-layer-canvas">
  <p class="ak-dark:ak-ink-80 ak-light:ak-ink-70">
    Appearance-adjusted secondary text.
  </p>

  <div
    class="ak-layer ak-frame ak-frame-field/field ak-frame-border ak-dark-high:ak-edge-20 ak-light-high:ak-edge-10"
  >
    Stronger edges on the darkest surfaces.
  </div>

  <p class="not-ak-dark:ak-ink-60">
    Subdued when the current layer is not dark.
  </p>
</div>
```

> `ak-dark` / `ak-light` and their band variants require a parent `ak-layer`. They're implemented as `@container` style queries, so they silently fail to match outside a layer rather than falling back to a default. Negated variants match whenever the queried layer value is absent or different, so wrap them in an `ak-layer` when relying on layer appearance.

### Accessibility

| Variant         | Matches when…                                                                                                                                                                                           |
| --------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `contrast-more` | The user has requested higher contrast (`@media (prefers-contrast: more)`). Automatically sets `--contrast: 100`, which pushes `ak-text`, `ak-edge`, and `ak-outline` lightness farther from the layer. |

You can opt extra utilities into high-contrast mode with `contrast-more:`:

```html
<button
  class="ak-layer ak-frame ak-frame-field/field ak-frame-ring contrast-more:ak-frame-border-2"
>
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
