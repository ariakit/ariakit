---
"@ariakit/tailwind": minor
---

Base styles of `ak-layer` and `ak-frame` in a nested layer

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
