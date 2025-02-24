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

   > [!NOTE]
   > Any `--color-*` variable will be automatically available to `ak-layer` and other Ariakit color utilities. See the [Theming](#theming) section for more information.

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

### `ak-layer-<number>`

Adjust lightness levels relative to the parent layer (default `1`, same as `ak-layer`):

```html
<div class="ak-layer-2">Slightly lighter canvas tone</div>
```

### `ak-layer-down`

Darken elements with `ak-layer-down`:

```html
<div class="ak-layer-down">Subtly darker canvas tone</div>
```

### `ak-layer-down-<number>`

Specify darkness levels (default `1`, equivalent to `ak-layer-down`):

```html
<div class="ak-layer-down-2">Slightly darker canvas tone</div>
```

### `ak-layer-<color>`

Apply specific colors that automatically meet accessibility standards:

```html
<div class="ak-layer-blue-500">Blue</div>
<div class="ak-layer-primary">Primary</div>
```

### `ak-layer-<color>-<number>`

Control color lightness (default `0`):

```html
<div class="ak-layer-primary-1">Slightly lighter primary</div>
```

> [!WARNING]
> Requires custom colors without numeric suffixes in theme definitions.

### `ak-layer-<color>-down-<number>`

Adjust color darkness (default `0`):

```html
<div class="ak-layer-primary-down-1">Slightly darker primary</div>
```

### `ak-layer-contrast`

Automatically adapt background colors for parent layer contrast:

```html
<div class="ak-layer-contrast">Contrast color</div>
```

### `ak-layer-contrast-<number>`

Adjust contrast lightness:

```html
<div class="ak-layer-contrast-2">Slightly lighter contrast color</div>
```

### `ak-layer-contrast-down-<number>`

Control contrast darkness:

```html
<div class="ak-layer-contrast-down-2">Slightly darker contrast color</div>
```

### `ak-layer-contrast-<color>`

Set color-adaptive contrast:

```html
<div class="ak-layer-contrast-blue-500">Blue</div>
<div class="ak-layer-contrast-primary">Primary</div>
```

### `ak-layer-contrast-<color>-<number>`

Adjust contrast color lightness:

```html
<div class="ak-layer-contrast-primary-2">Slightly lighter primary contrast</div>
```

### `ak-layer-contrast-<color>-down-<number>`

Control contrast color darkness:

```html
<div class="ak-layer-contrast-primary-down-2">
  Slightly darker primary contrast
</div>
```

### `ak-layer-mix`

Blend colors with parent layers (default 50% mix):

### `ak-layer-mix-<color>`

Color blending examples:

```html
<div class="ak-layer-mix-blue-500">50% blue mix</div>
<div class="ak-layer-mix-primary/25">25% primary mix</div>
```

### `ak-layer-mix-<color>-<number>`

Adjust mix color lightness:

```html
<div class="ak-layer-mix-primary-2/25">25% primary-2 mix</div>
```

### `ak-layer-mix-<color>-down-<number>`

Control mix color darkness:

```html
<div class="ak-layer-mix-primary-down-2/25">25% primary-down-2 mix</div>
```

### `ak-layer-pop`

Reverse tone for hover effects:

```html
<button class="ak-layer-primary hover:ak-layer-pop">Button</button>
```

### `ak-layer-pop-<number>`

Adjust pop intensity:

```html
<div class="ak-layer-pop-2">Stronger tone shift</div>
```

### `ak-layer-pop-<color>`

Color-specific pop effects:

```html
<button class="ak-layer-pop-primary">Primary button</button>
```

### `ak-layer-pop-<color>-<number>`

Customize color pop intensity:

```html
<button class="ak-layer-pop-primary-2">Enhanced primary effect</button>
```

### `ak-layer-pop-vivid`

Adjust both lightness and saturation:

```html
<div class="ak-layer-pop-vivid">Vivid tone shift</div>
```

### `ak-layer-pop-vivid-<number>`

Control vivid effect strength:

```html
<div class="ak-layer-pop-vivid-2">Stronger vivid effect</div>
```

### `ak-layer-pop-vivid-<color>`

Color-specific vivid effects:

```html
<button class="ak-layer-pop-vivid-primary">Vivid primary button</button>
```

### `ak-layer-pop-vivid-<color>-<number>`

Adjust vivid color intensity:

```html
<button class="ak-layer-pop-vivid-primary-2">Enhanced vivid primary</button>
```

### `ak-layer-feature`

Highlight important elements:

```html
<div class="ak-layer-feature">Feature</div>
```

### `ak-layer-feature-<number>`

Adjust feature intensity:

```html
<div class="ak-layer-feature-2">Stronger feature</div>
```

### `ak-layer-feature-<color>`

Color-specific feature effects:

```html
<div class="ak-layer-feature-primary">Primary feature</div>
```

### `ak-layer-feature-<color>-<number>`

Customize feature color intensity:

```html
<div class="ak-layer-feature-primary-2">Enhanced primary feature</div>
```

## Core Team

- [Diego Haz](https://bsky.app/profile/haz.dev)
- [Ben Rodri](https://bsky.app/profile/ben.ariakit.org)
- [Dani Guardiola](https://bsky.app/profile/dio.la)

## Contributing

Follow the instructions on the [contributing guide](https://github.com/ariakit/ariakit/blob/main/contributing.md).
