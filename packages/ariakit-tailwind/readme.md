# Ariakit Tailwind

**Important:** This package is currently experimental. Breaking changes might be introduced in patch or minor releases.

Ariakit Tailwind is a Tailwind CSS plugin that brings Ariakit Styles to your projects. It enables developers to create accessible design systems using relative colors and radii instead of fixed values, ensuring full user customization without sacrificing visual consistency.

Ariakit Tailwind is framework and library agnostic, requiring only Tailwind CSS v4. It works with any frontend framework—including React, Vue, and Svelte—and is compatible with any component library such as Ariakit React, Radix UI, and React Aria.

## Get started

1. [Install Tailwind v4](https://tailwindcss.com/docs/installation/using-vite)

2. Install Ariakit Tailwind:

   ```
   npm i @ariakit/tailwind
   ```

3. Import `@ariakit/tailwind` in your CSS file:

   ```css
   @import "tailwindcss";
   @import "@ariakit/tailwind";
   ```

4. Apply the base layer to any container element (must **not** be `html` or `:root`):

   <!-- prettier-ignore -->
   ```html
   <body class="ak-layer ak-layer-white dark:ak-layer-gray-950">
   ```

   or:

   ```css
   body {
     @apply ak-layer ak-layer-white dark:ak-layer-gray-950;
   }
   ```

## Theming

Ariakit Tailwind integrates seamlessly with Tailwind's theming system. You can define custom colors, radii, and spacing values that are automatically available to Ariakit utilities:

```css
@theme {
  /**
   * Any --color-* variable is automatically accessible in ak-layer, ak-text,
   * ak-edge, and other color utilities. These names are recommended, but you
   * can choose any names you prefer.
   */
  --color-canvas: #f1f1f1;
  --color-primary: #007acc;
  --color-secondary: #ec4899;

  /**
   * Any --radius-* and --spacing-* variable, including built-in ones like lg,
   * xl, and numerical values, is automatically available in ak-frame utilities.
   * Using the same name lets you omit the padding part of the utility.
   * For example, ak-frame-field/field applies both --radius-field and
   * --spacing-field.
   */
  --radius-container: var(--radius-xl);
  --spacing-container: --spacing(1);

  --radius-field: var(--radius-xl);
  --spacing-field: --spacing(2);
}

/* Dark theme */
:root {
  @variant dark {
    --color-canvas: #0e0e11;
  }
}
```

With the theme above, you can update the base layer to use the custom colors:

<!-- prettier-ignore -->
```diff
- <body class="ak-layer ak-layer-white dark:ak-layer-gray-950">
+ <body class="ak-layer ak-layer-canvas">
```

## `ak-layer`

Layers form the foundation of Ariakit Styles, following the principle that stacked layers should appear progressively lighter while lower layers maintain darker tones, regardless of light or dark mode.

The `ak-layer` utility is the required base class. It sets an element's background, text, border, and shadow colors while ensuring readable contrast. Modifier utilities (`ak-layer-*`) control the layer's appearance.

```html
<body class="ak-layer ak-layer-canvas">
  <div class="ak-layer">Subtly lighter canvas tone</div>
</body>
```

Layers define edge and shadow colors. Display them using `ak-frame-border`, `ak-frame-ring`, or Tailwind's `shadow`:

```html
<div class="ak-layer ak-frame ak-frame-border">Border</div>
<div class="ak-layer ak-frame ak-frame-ring">Ring</div>
<div class="ak-layer shadow-xl">Shadow</div>
```

Use [`ak-edge`](#ak-edge) to fine-tune border and ring colors.

| Utility                        | Description                                                                |
| ------------------------------ | -------------------------------------------------------------------------- |
| `ak-layer`                     | Required base class. Sets background, text, border, and shadow colors.     |
| `ak-layer-<number>`            | Adjusts lightness relative to parent layer (`0`–`100`).                    |
| `ak-layer-<color>`             | Sets the layer to a specific color.                                        |
| `ak-layer-lighten-<number>`    | Lightens the layer by `<number>`.                                          |
| `ak-layer-darken-<number>`     | Darkens the layer by `<number>`.                                           |
| `ak-layer-mix`                 | Mixes the layer base with the mix color (default: parent).                 |
| `ak-layer-mix-<number>`        | Sets the mix amount (`0`–`100`).                                           |
| `ak-layer-mix-<color>`         | Sets the mix color.                                                        |
| `ak-layer-push-<number>`       | Sets minimum lightness shift (self-relative), jumping the forbidden range. |
| `ak-layer-contrast`            | Adapts color for contrast against the parent layer.                        |
| `ak-layer-contrast-<number>`   | Adjusts contrast amount (`0`–`100`, default `25`).                         |
| `ak-layer-invert`              | Inverts the layer lightness.                                               |
| `ak-layer-warm-<number>`       | Shifts hue toward warm tones.                                              |
| `ak-layer-cool-<number>`       | Shifts hue toward cool tones.                                              |
| `ak-layer-saturate-<number>`   | Increases chroma.                                                          |
| `ak-layer-desaturate-<number>` | Decreases chroma.                                                          |
| `ak-state-<number>`            | Adjusts lightness for interactive states (similar to `ak-layer-<number>`). |

## `ak-layer-text`

Controls text opacity relative to the parent layer. This is self-contained and does not require `ak-layer` on the same element.

```html
<div class="ak-layer ak-layer-canvas">
  <p class="ak-layer-text-70">70% text opacity</p>
  <p class="ak-layer-text-0">Minimum readable opacity (WCAG AA)</p>
</div>
```

| Utility                  | Description                                            |
| ------------------------ | ------------------------------------------------------ |
| `ak-layer-text-<number>` | Sets text opacity (`0`–`100`). `0` = minimum readable. |

## `ak-text`

With `ak-text` utilities, text colors automatically adjust for readability based on their parent layer. Elements with `ak-text` must be children of an element with `ak-layer`.

```html
<div class="ak-layer ak-layer-canvas">
  <span class="ak-text ak-text-primary">Primary text color</span>
</div>
```

| Utility                    | Description                                            |
| -------------------------- | ------------------------------------------------------ |
| `ak-text`                  | Required base class for colored text.                  |
| `ak-text-<color>`          | Applies a specific text color with automatic contrast. |
| `ak-text-<number>`         | Adjusts contrast lightness (`0` = minimum).            |
| `ak-text-lighten-<number>` | Lightens the text color.                               |
| `ak-text-darken-<number>`  | Darkens the text color.                                |
| `ak-text-layer`            | Sets text color to the current layer color.            |

## `ak-edge`

`ak-edge` utilities define border and ring colors on top of [`ak-layer`](#ak-layer).

```html
<div class="ak-layer ak-frame ak-frame-border ak-edge-10">10% edge opacity</div>
```

| Utility                       | Description                                |
| ----------------------------- | ------------------------------------------ |
| `ak-edge-<number>`            | Sets edge alpha (`0`–`100`, default `10`). |
| `ak-edge-<color>`             | Applies a specific edge color.             |
| `ak-edge-lighten-<number>`    | Lightens the edge color.                   |
| `ak-edge-darken-<number>`     | Darkens the edge color.                    |
| `ak-edge-contrast-<number>`   | Adjusts edge lightness for contrast.       |
| `ak-edge-saturate-<number>`   | Increases edge chroma.                     |
| `ak-edge-desaturate-<number>` | Decreases edge chroma.                     |

## `ak-outline`

`ak-outline` utilities set an outline color that adapts to the parent layer contrast.

```html
<div class="ak-layer ak-outline ak-outline-primary outline-2">Outlined</div>
```

| Utility              | Description                                |
| -------------------- | ------------------------------------------ |
| `ak-outline`         | Required base class for adaptive outlines. |
| `ak-outline-<color>` | Applies a specific outline color.          |

## `ak-frame`

`ak-frame` utilities define border radii and padding relative to their parent frame. When no parent frame exists, it uses the provided value as an absolute measurement.

```html
<!-- p-1 rounded-2xl -->
<div class="ak-frame ak-frame-2xl/1">
  <!-- rounded adjusted based on parent, p-4 -->
  <div class="ak-frame ak-frame-2xl/4"></div>
</div>
```

To apply a specific radius regardless of the parent frame, use the `ak-frame-force` utility:

```html
<div class="ak-frame ak-frame-2xl/1">
  <!-- forces rounded-xl regardless of parent -->
  <div class="ak-frame ak-frame-force ak-frame-xl/4"></div>
</div>
```

> [!WARNING]
> Border sizes must be factored into radius calculations. Always use `ak-frame-border` instead of Tailwind's `border` utility for proper integration:
>
> ```html
> <!-- ❌ -->
> <div class="ak-frame ak-frame-xl/1 border">Border</div>
> ```
>
> ```html
> <!-- ✅ -->
> <div class="ak-frame ak-frame-xl/1 ak-frame-border">Border</div>
> ```

Frame presets include a `/name` suffix that sets the token scope for padding and radius:

```css
@theme {
  --radius-container: var(--radius-xl);
  --spacing-container: --spacing(1);
}
```

```html
<!-- rounded-xl p-1 (applies both --radius-container and --spacing-container) -->
<div class="ak-frame ak-frame-container/container"></div>
```

| Utility                      | Description                                                                    |
| ---------------------------- | ------------------------------------------------------------------------------ |
| `ak-frame`                   | Required base class. Sets up frame context for radius and padding inheritance. |
| `ak-frame-force`             | Forces the frame radius, ignoring parent frame context.                        |
| `ak-frame-<length>`          | Sets border radius (relative to parent frame).                                 |
| `ak-frame-<length>/<length>` | Sets border radius and padding.                                                |
| `ak-frame-p-<number>`        | Sets frame padding.                                                            |
| `ak-frame-m-<number>`        | Sets frame margin.                                                             |
| `ak-frame-border`            | Applies border width that influences nested element radius calculations.       |
| `ak-frame-ring`              | Sets frame ring width.                                                         |
| `ak-frame-bordering`         | Splits border width between border/ring based on layer lightness.              |
| `ak-frame-cover`             | Stretches element to parent padding (negative margin).                         |
| `ak-frame-overflow`          | Stretches element to parent padding + border + ring.                           |
| `ak-frame-start`             | Applies start (top) edge styles of frame-cover.                                |
| `ak-frame-end`               | Applies end (bottom) edge styles of frame-cover.                               |
| `ak-frame-row`               | Sets horizontal frame flow.                                                    |
| `ak-frame-col`               | Sets vertical frame flow.                                                      |

## `ak-light` and `ak-dark`

The `ak-light` and `ak-dark` variants allow you to conditionally apply styles based on the parent layer's appearance:

```html
<div class="ak-layer ak-layer-canvas">
  <!-- Styles will only apply when parent layer is light -->
  <div class="ak-light:ak-layer-lighten-6">Light mode only</div>

  <!-- Styles will only apply when parent layer is dark -->
  <div class="ak-dark:ak-layer-darken-6">Dark mode only</div>
</div>
```

## Migrating from v0.1

See [`MIGRATING_FROM_V01.md`](./MIGRATING_FROM_V01.md) for all breaking changes.

## Core Team

- [Diego Haz](https://bsky.app/profile/haz.dev)
- [Ben Rodri](https://bsky.app/profile/ben.ariakit.org)
- [Dani Guardiola](https://bsky.app/profile/dio.la)

## Contributing

Follow the instructions on the [contributing guide](https://github.com/ariakit/ariakit/blob/main/contributing.md).
