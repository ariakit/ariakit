---
"@ariakit/tailwind": minor
---

Ariakit Tailwind v0.2

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
