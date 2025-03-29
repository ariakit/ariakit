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
   <body class="ak-layer-white dark:ak-layer-gray-950">
   ```

   or:

   ```css
   body {
     @apply ak-layer-white dark:ak-layer-gray-950;
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
   * For example, ak-frame-container applies both --radius-container and
   * --spacing-container.
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
- <body class="ak-layer-white dark:ak-layer-gray-950">
+ <body class="ak-layer-canvas">
```

## `ak-layer`

Layers form the foundation of Ariakit Styles, following the principle that stacked layers should appear progressively lighter while lower layers maintain darker tones, regardless of light or dark mode.

The `ak-layer` utility sets an element's background, text, border, and shadow colors while ensuring readable contrast.

```html
<body class="ak-layer-canvas">
  <div class="ak-layer">Subtly lighter canvas tone</div>
</body>
```

Layers define edge and shadow colors. Display them using Tailwind utilities like `border`, `ring`, and `shadow`:

```html
<div class="ak-layer border">Border</div>
<div class="ak-layer ring">Ring</div>
<div class="ak-layer shadow-xl">Shadow</div>
```

Use [`ak-edge`](#ak-edge) to fine-tune border and ring colors.

| Utility                                   | Description                                                            |
| ----------------------------------------- | ---------------------------------------------------------------------- |
| `ak-layer`                                | Lightens the layer color (equivalent to `ak-layer-1`).                 |
| `ak-layer-<number>`                       | Adjusts lightness levels relative to the parent layer (default `1`).   |
| `ak-layer-down`                           | Darkens the layer color (equivalent to `ak-layer-down-1`).             |
| `ak-layer-down-<number>`                  | Specifies darkness levels (default `1`).                               |
| `ak-layer-<color>`                        | Applies specific color.                                                |
| `ak-layer-<color>-<number>`               | Controls color lightness (default `0`).                                |
| `ak-layer-<color>-down-<number>`          | Adjusts color darkness (default `0`).                                  |
| `ak-layer-pop`                            | Inverts tone of the layer (darker on light, lighter on dark).          |
| `ak-layer-pop-<number>`                   | Adjusts pop intensity (default `1`).                                   |
| `ak-layer-pop-<color>`                    | Applies pop effect to a specific color rather than the parent layer.   |
| `ak-layer-pop-<color>-<number>`           | Customizes color pop intensity.                                        |
| `ak-layer-contrast`                       | Automatically adapts color for parent layer contrast.                  |
| `ak-layer-contrast-<number>`              | Adjusts contrast color lightness.                                      |
| `ak-layer-contrast-down-<number>`         | Controls contrast color darkness.                                      |
| `ak-layer-contrast-<color>`               | Automatically adapts specific color for parent layer contrast.         |
| `ak-layer-contrast-<color>-<number>`      | Adjusts contrast color lightness.                                      |
| `ak-layer-contrast-<color>-down-<number>` | Controls contrast color darkness.                                      |
| `ak-layer-mix-<color>`                    | Blends color with parent layer.                                        |
| `ak-layer-mix-<color>/<number>`           | Blends color with parent layer at a specific ratio (default `50`).     |
| `ak-layer-mix-<color>-<number>`           | Adjusts mix color lightness (can be combined with mix ratios).         |
| `ak-layer-mix-<color>-down-<number>`      | Controls mix color darkness (can be combined with mix ratios).         |
| `ak-layer-hover`                          | Inverts tone of the layer (darker on light, lighter on dark).          |
| `ak-layer-hover-<number>`                 | Adjusts hover intensity (default `1`).                                 |
| `ak-layer-hover-<color>`                  | Applies hover effect to a specific color rather than the parent layer. |
| `ak-layer-hover-<color>-<number>`         | Customizes color hover intensity.                                      |
| `ak-layer-hover-vivid`                    | Adjusts both lightness and saturation for a vivid tone shift.          |
| `ak-layer-hover-vivid-<number>`           | Controls the strength of the vivid effect.                             |
| `ak-layer-hover-vivid-<color>`            | Provides color-specific vivid effects.                                 |
| `ak-layer-hover-vivid-<color>-<number>`   | Adjusts vivid color intensity.                                         |
| `ak-layer-feature`                        | Highlights important elements.                                         |
| `ak-layer-feature-<number>`               | Adjusts feature intensity.                                             |
| `ak-layer-feature-<color>`                | Provides color-specific feature effects.                               |
| `ak-layer-feature-<color>-<number>`       | Customizes feature color intensity.                                    |

## `ak-text`

With `ak-text` utilities, text colors and opacity automatically adjust for readability based on their parent layer.

```html
<div class="ak-layer-canvas ak-text/60">
  This text will be 60% opaque if supported. Otherwise, Ariakit will adjust it
  for better readability.
</div>
```

> [!WARNING]
> When specifying a color, elements with the `ak-text-<color>` class must be children of an element with an `ak-layer-*` class.
>
> ```html
> <!-- ❌ -->
> <div class="ak-layer-canvas ak-text-primary">Primary text color</div>
> ```
>
> ```html
> <!-- ✅ -->
> <div class="ak-layer-canvas">
>   <div class="ak-text-primary">Primary text color</div>
> </div>
> ```

| Utility                    | Description                                                  |
| -------------------------- | ------------------------------------------------------------ |
| `ak-text/<number>`         | Adjusts text opacity.                                        |
| `ak-text-<color>`          | Applies specific color.                                      |
| `ak-text-<color>/<number>` | Adjusts the amount of white/black (default `75`).            |
| `ak-text-<color>-<number>` | Applies specific color tone (can be combined with modifier). |

## `ak-edge`

`ak-edge` utilities define border and ring colors on top of [`ak-layer`](#ak-layer).

```html
<div class="ak-layer-canvas ak-edge/10 border">Border</div>
<div class="ak-layer-canvas ak-edge/10 ring">Ring</div>
```

| Utility                             | Description                                                           |
| ----------------------------------- | --------------------------------------------------------------------- |
| `ak-edge/<number>`                  | Adjusts edge base opacity (default `10`).                             |
| `ak-edge-<number>`                  | Adjusts edge color lightness (default `0`).                           |
| `ak-edge-<color>`                   | Applies specific color.                                               |
| `ak-edge-<color>-<number>`          | Adjusts edge color lightness.                                         |
| `ak-edge-contrast`                  | Automatically adapts color for parent layer contrast.                 |
| `ak-edge-contrast-<number>`         | Adjusts contrast color lightness (default `0`).                       |
| `ak-edge-contrast-<color>`          | Automatically adapts specific color for parent layer contrast.        |
| `ak-edge-contrast-<color>-<number>` | Adjusts contrast color lightness (default `0`).                       |
| `ak-edge-shadow`                    | Applies dark edge color even if parent layer is dark (but not black). |
| `ak-edge-shadow/<number>`           | Adjusts dark edge color base opacity (default `10`).                  |
| `ak-edge-shadow-<number>`           | Adjusts dark edge color lightness.                                    |

## `ak-frame`

`ak-frame` utilities define border radii and padding relative to their parent frame. When no parent frame exists, it uses the provided value as an absolute measurement.

```html
<!-- rounded-xl p-1 -->
<div class="ak-frame-xl/1">
  <!-- rounded-lg (adjusted based on parent) p-4 -->
  <div class="ak-frame-2xl/4"></div>
</div>
```

To apply a specific radius regardless of the parent frame, use the `ak-frame-force` utility:

```html
<!-- rounded-xl p-1 -->
<div class="ak-frame-xl/1">
  <!-- rounded-xl p-4 -->
  <div class="ak-frame-force-xl/4"></div>
</div>
```

> [!WARNING]
> Border sizes must be factored into radius calculations. Always use `ak-frame-border` instead of Tailwind's `border` utility for proper integration:
>
> ```html
> <!-- ❌ -->
> <div class="ak-frame-xl/1 border">Border</div>
> ```
>
> ```html
> <!-- ✅ -->
> <div class="ak-frame-xl/1 ak-frame-border">Border</div>
> ```

If you define custom `--radius-*` and `--spacing-*` variables, you can use them directly in `ak-frame` utilities. Use the same name to omit the padding part of the utility:

```css
@theme {
  --radius-container: var(--radius-xl);
  --spacing-container: --spacing(1);
}
```

```html
<!-- rounded-xl p-1 (same as ak-frame-container/container or ak-frame-xl/1) -->
<div class="ak-frame-container"></div>
```

| Utility                               | Description                                                                |
| ------------------------------------- | -------------------------------------------------------------------------- |
| `ak-frame`                            | Applies border radius and padding (relative to parent frame).              |
| `ak-frame-<length>`                   | Sets specific border radius when no parent frame is present.               |
| `ak-frame-<length>/<length>`          | Applies specific border radius (without parent frame) and padding.         |
| `ak-frame-border`                     | Applies border width that influences nested element radius calculations.   |
| `ak-frame-cover`                      | Covers parent frame padding with a negative margin.                        |
| `ak-frame-cover-<length>`             | Covers parent padding and sets specific radius (no parent).                |
| `ak-frame-cover-<length>/<length>`    | Covers parent padding and applies specific radius (no parent) and padding. |
| `ak-frame-cover-start`                | Applies top edge styles of frame-cover (for manual control).               |
| `ak-frame-cover-end`                  | Applies bottom edge styles of frame-cover (for manual control).            |
| `ak-frame-overflow`                   | Clips content to the frame's border radius.                                |
| `ak-frame-overflow-<length>`          | Clips content and sets specific radius (no parent).                        |
| `ak-frame-overflow-<length>/<length>` | Clips content and applies specific radius (no parent) and padding.         |
| `ak-frame-force-<length>`             | Forces specific border radius, overriding parent frame settings.           |
| `ak-frame-force-<length>/<length>`    | Forces specific radius and padding, ignoring parent frame.                 |

## `ak-light` and `ak-dark`

The `ak-light` and `ak-dark` variants allow you to conditionally apply styles based on the parent layer's appearance:

```html
<div class="ak-layer-canvas">
  <!-- Styles will only apply when parent layer is light -->
  <div class="ak-light:ak-layer-2">Light mode only</div>

  <!-- Styles will only apply when parent layer is dark -->
  <div class="ak-dark:ak-layer-2">Dark mode only</div>
</div>
```

## Core Team

- [Diego Haz](https://bsky.app/profile/haz.dev)
- [Ben Rodri](https://bsky.app/profile/ben.ariakit.org)
- [Dani Guardiola](https://bsky.app/profile/dio.la)

## Contributing

Follow the instructions on the [contributing guide](https://github.com/ariakit/ariakit/blob/main/contributing.md).
