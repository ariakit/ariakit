# Migrating to v0.2

This guide covers all breaking changes for users of the `@ariakit/tailwind` plugin.

## General principles

1. **Explicit base classes.** Utilities like `ak-layer`, `ak-frame`, `ak-text`, and `ak-outline` must now appear as base classes before their modifiers.
2. **Slash to hyphen.** Opacity/value syntax changes from `/N` to `-N`. Text opacity moves from `ak-text/80` to `ak-ink-80`.
3. **`color:` prefix for custom properties.** Custom CSS variable colors now use `(color:--var)` instead of `(--var)`.
4. **Unified `--ak-edge`.** The CSS variables `--ak-layer-border`, `--ak-border`, `--ak-ring`, and `--ak-layer-ring` are all replaced by `--ak-edge`.

---

## Layer

### `ak-layer` is now required as an explicit base class

All layer modifier utilities (`ak-layer-*`) now require the `ak-layer` base class to be present. Previously, compound layer utilities implicitly included the layer setup.

### `ak-layer-current` → `ak-layer`

The `ak-layer-current` utility (which inherited the current background) is removed. Bare `ak-layer` now does this.

```diff
- ak-layer-current
+ ak-layer
```

### `ak-layer-pop` → `ak-layer ak-layer-6`

The `ak-layer-pop` shorthand (a subtle lighten) is decomposed into base + explicit lightness step.

```diff
- ak-layer-pop
+ ak-layer ak-layer-6

- ak-layer-pop-0.5
+ ak-layer ak-layer-3

- ak-layer-pop-1.5
+ ak-layer ak-layer-9

- ak-layer-pop-2
+ ak-layer ak-layer-12
```

### `ak-layer-down` → `ak-layer ak-layer-darken-6`

The `ak-layer-down` shorthand (darken) is decomposed.

```diff
- ak-layer-down
+ ak-layer ak-layer-darken-6

- ak-layer-down-0.5
+ ak-layer ak-layer-darken-3
```

### `ak-layer` (old implicit lighten) → `ak-layer ak-layer-lighten-6`

In contexts where bare `ak-layer` previously implied a subtle lighten (e.g., popovers, inputs, checkboxes), the lighten amount must now be explicit.

```diff
- ak-layer
+ ak-layer ak-layer-lighten-6
```

### `ak-layer-hover` → `ak-layer ak-state-6`

The hover layer shorthand is replaced by `ak-state-N` for interactive state lightness.

```diff
- ak-layer-hover
+ ak-layer ak-state-6

- ak-layer-hover-0.5
+ ak-layer ak-state-3
```

When the element already has `ak-layer`, only `ak-state-6` needs to be added.

### `ak-layer-contrast-primary` → `ak-layer ak-layer-primary ak-layer-contrast`

Compound contrast layer utilities are decomposed into color + parent-relative contrast.

In v0.1, `ak-layer-contrast-<color>` adjusted the color's lightness to contrast against the **parent** layer. In v0.2, this is handled by `ak-layer-contrast` (base) + optionally `ak-layer-contrast-N` (amount). The base utility uses container queries to derive contrast direction from the parent layer's lightness and includes a default contrast amount of 25 (matching the old default of ~3:1).

```diff
- ak-layer-contrast-primary
+ ak-layer ak-layer-primary ak-layer-contrast
```

`ak-layer-contrast-N` overrides the default contrast amount. Higher values push the color further from the parent's lightness; `ak-layer-contrast-0` disables the push entirely (useful when you want the raw color without any contrast adjustment):

```diff
  <!-- Keep the color as-is, no automatic contrast -->
- ak-layer-secondary
+ ak-layer ak-layer-secondary ak-layer-contrast ak-layer-contrast-0
```

### `ak-layer-canvas` → `ak-layer ak-layer-canvas`

```diff
- ak-layer-canvas
+ ak-layer ak-layer-canvas
```

### `ak-layer-(--var)` → `ak-layer ak-layer-(color:--var)`

Custom color layers now use the `color:` prefix.

```diff
- ak-layer-(--my-color)
+ ak-layer ak-layer-(color:--my-color)
```

### Variant prefixes on modifier classes

When `ak-layer` is already on the element unconditionally, variant-prefixed modifiers work without re-applying `ak-layer`:

```diff
  <!-- ak-layer already present — just add the modifier with a variant -->
- ak-layer hover:ak-layer hover:ak-layer-6
+ ak-layer hover:ak-layer-6

  <!-- Different modifiers in light/dark — no need to reset with ak-light:ak-layer -->
- ak-layer ak-layer-lighten-3 ak-light:ak-layer
+ ak-layer ak-dark:ak-layer-lighten-3

  <!-- Different darken per mode -->
- ak-layer ak-layer-darken-6 ak-light:ak-layer ak-light:ak-layer-darken-3
+ ak-layer ak-dark:ak-layer-darken-6 ak-light:ak-layer-darken-3
```

When `ak-layer` is NOT already on the element and should only appear conditionally, the variant prefix IS needed on `ak-layer`:

```html
<!-- No base ak-layer — need it on hover for background to appear -->
<div class="hover:ak-layer hover:ak-layer-6">...</div>

<!-- No base ak-layer — need it on data-open for background to appear -->
<div class="data-open:ak-layer data-open:ak-layer-6">...</div>
```

---

## Layer mix

### `ak-layer-mix-(--color)/N` → `ak-layer ak-layer-(color:--color) ak-layer-mix-N`

The color is now set via `ak-layer-<color>`, and `ak-layer-mix-N` controls how much of that color is mixed into the parent. The number stays the same.

```diff
- ak-layer-mix-(--my-color)/15
+ ak-layer ak-layer-(color:--my-color) ak-layer-mix-15

- ak-layer-mix-primary/20
+ ak-layer ak-layer-primary ak-layer-mix-20

- ak-layer-mix-red-500/30
+ ak-layer ak-layer-red-500 ak-layer-mix-30
```

Note: `ak-layer-mix-<color>` (with a color directly on the mix utility) is a **new** v0.2 feature for mixing another color into the current layer — it is not the migration path for the old `/N` syntax.

---

## Text

### `ak-text/N` → `ak-ink-N`

Text opacity is now `ak-ink-N`. It is self-contained and does not require `ak-layer` on the same element.

```diff
- ak-text/80
+ ak-ink-80
```

Note: the bare `ak-text-N` utility still exists but now only controls **contrast lightness** for the directional `ak-text` text color system (see below). It no longer sets text alpha.

### Bare `ak-text` for opacity reset → `ak-ink-100`

In v0.1, bare `ak-text` was sometimes used to reset text opacity inherited from a parent's `ak-text/N`. In v0.2, text opacity is controlled by `ak-ink-N`. Resetting it to full opacity uses `ak-ink-100`.

```diff
- ak-text
+ ak-ink-100

  <!-- Conditional reset -->
- data-active:ak-text
+ data-active:ak-ink-100
```

### `ak-text-COLOR/N` → `ak-text ak-text-COLOR`

Color text now requires the `ak-text` base class. The `/N` modifier in v0.1 controlled lightness contrast — how far the text color was pushed away from the background for readability (default `/75`, minimum `53` in LCH). In v0.2, contrast is handled automatically with a minimum floor, so the modifier can be dropped in most cases.

If you need to increase contrast beyond the default, add `ak-text-N` alongside the color class, where `N` represents contrast lightness (0 = minimum/default, higher = more contrast). Values at or below the old default of `/75` should simply be dropped — the new automatic minimum (equivalent to ~52 in the new scale) handles them.

```diff
- ak-text-primary/0
+ ak-text ak-text-primary

- ak-text-primary/50
+ ak-text ak-text-primary

- ak-text-primary/70
+ ak-text ak-text-primary

- ak-text-primary
+ ak-text ak-text-primary

- ak-text-(--color)/70
+ ak-text ak-text-(color:--color)
```

### `ak-text-(--var)` → `ak-text ak-text-(color:--var)`

Custom color text now uses the `color:` prefix.

```diff
- ak-text-(--my-color)
+ ak-text ak-text-(color:--my-color)
```

---

## Edge (border/ring)

### `ak-edge/N` → `ak-edge-N`

```diff
- ak-edge/15
+ ak-edge-15
```

### `ak-edge-(--color)/N` → `ak-edge-(color:--color) ak-edge-N`

```diff
- ak-edge-(--my-color)/10
+ ak-edge-(color:--my-color) ak-edge-10
```

### `ak-edge-contrast-primary` → `ak-edge-primary ak-edge-raw`

In v0.1, `ak-edge-contrast-<color>` set the edge to a solid color with lightness adjusted for contrast against the layer background. In v0.2, `ak-edge-<color>` sets the color and `ak-edge-raw` locks it to full opacity with no lightness push, matching the old solid behavior.

```diff
- ak-edge-contrast-primary
+ ak-edge-primary ak-edge-raw
```

`ak-edge-raw` is shorthand for `ak-edge-100 ak-edge-push-0` — use it when you want the color to be applied exactly as specified. For other combinations, `ak-edge-N` controls alpha (`100` = opaque) and `ak-edge-push-N` controls how far the edge lightness is pushed away from the layer (`0` = the color's natural lightness).

### CSS variable renames (color)

| Old                 | New         |
| ------------------- | ----------- |
| `--ak-layer-border` | `--ak-edge` |
| `--ak-border`       | `--ak-edge` |
| `--ak-ring`         | `--ak-edge` |
| `--ak-layer-ring`   | `--ak-edge` |

Update any inline references (e.g., `stroke-(--ak-layer-border)` → `stroke-(--ak-edge)`).

### Width utility renames

| Old         | New               |
| ----------- | ----------------- |
| `ak-border` | `ak-frame-border` |
| `ak-ring`   | `ak-frame-ring`   |

The corresponding CSS variables `--ak-frame-border` and `--ak-frame-ring` are unchanged.

---

## Frame

### `ak-frame` is now required as an explicit base class

All frame shape utilities require the `ak-frame` base class.

### Frame presets now use a `/token` suffix

Frame shape presets include a `/name` suffix that sets the token scope for padding and radius.

```diff
- ak-frame-field
+ ak-frame ak-frame-field/field

- ak-frame-card
+ ak-frame ak-frame-card/card

- ak-frame-container
+ ak-frame ak-frame-container/container

- ak-frame-dialog
+ ak-frame ak-frame-dialog/dialog

- ak-frame-badge
+ ak-frame ak-frame-badge/badge
```

### `ak-frame/N` → `ak-frame ak-frame-p-N`

Padding is now a separate utility.

```diff
- ak-frame/2
+ ak-frame ak-frame-p-2
```

### `ak-frame-cover/N` → `ak-frame ak-frame-cover ak-frame-p-N`

The slash syntax for padding on cover utilities is split.

```diff
- ak-frame-cover/1.5
+ ak-frame ak-frame-cover ak-frame-p-1.5
```

When used with variant prefixes, the prefix must be applied to **each** split utility:

```diff
- sm:ak-frame-cover/1
+ sm:ak-frame sm:ak-frame-cover sm:ak-frame-p-1
```

### `ak-frame-cover-start` / `ak-frame-cover-end` → `ak-frame ak-frame-start` / `ak-frame-end`

```diff
- ak-frame-cover-start ak-frame-cover-end
+ ak-frame ak-frame-start ak-frame-end
```

### `ak-frame-force-TYPE` → `ak-frame ak-frame-force ak-frame-TYPE/TYPE`

The force modifier is now a separate utility.

```diff
- ak-frame-force-dialog
+ ak-frame ak-frame-force ak-frame-dialog/dialog

- ak-frame-force-container
+ ak-frame ak-frame-force ak-frame-container/container
```

### `ak-frame-overflow` → `ak-frame ak-frame-cover`

`ak-frame-overflow` has been removed. Use `ak-frame-cover` instead — it now automatically handles all border/ring combinations, collapsing shared borders when both parent and child have them.

```diff
- ak-frame-overflow
+ ak-frame ak-frame-cover

- ak-frame-overflow ak-frame-p-1
+ ak-frame ak-frame-cover ak-frame-p-1
```

### Compound utility + frame override requires explicit `ak-frame`

When overriding a compound utility's frame token (e.g., `ak-button` + `ak-frame-field/1`), you must add an explicit `ak-frame` class. Without it, the compound utility's inlined padding-block longhand isn't reset by the shorthand.

```diff
- ak-button ak-frame-field/1
+ ak-button ak-frame ak-frame-field/1
```

---

## Outline

### `ak-outline-primary` → `ak-outline ak-outline-primary`

```diff
- ak-outline-primary
+ ak-outline ak-outline-primary
```

---

## Bordering

### `ak-bordering` → `ak-frame-bordering`

```diff
- ak-bordering
+ ak-frame-bordering
```

---

## Badge

### `ak-badge-(--var)` → `ak-badge-(color:--var)`

Custom color badges now use the `color:` prefix.

```diff
- ak-badge-(--status-color)
+ ak-badge-(color:--status-color)
```

---

## Known issues

### `ak-text` sets `background-color: transparent !important`

The `ak-text` utility forces `background-color: transparent !important`. If a custom utility needs both `ak-layer` (for background) and `ak-text` (for text color), it must re-apply the background after `ak-text`:

```css
@utility my-utility {
  @apply ak-layer ak-text;
  background-color: var(--ak-layer) !important;
}
```

### `ak-layer-(color:--var)` does not reset same-element darken/lighten

In v0.1, compound utilities like `ak-layer-(--var)` replaced the entire layer, including any darken/lighten. In v0.2, `ak-layer-(color:--var)` only sets the layer color — it does **not** reset `ak-layer-darken-*` or `ak-layer-lighten-*` that were set on the same element by another utility.

Darken/lighten from a **parent** element does not propagate to children. This only applies when both utilities expand onto the **same** element (e.g., via `@apply` composition or multiple classes).

If an element has both `ak-layer-darken-*` (from one utility) and `ak-layer-(color:--var)` (from another), add `ak-layer-darken-0` or `ak-layer-lighten-0` to reset:

```diff
  <!-- ak-tab-list expands ak-layer-darken-6 on the same element -->
- ak-tab-list ak-layer ak-layer-(color:--ak-layer-parent)
+ ak-tab-list ak-layer ak-layer-(color:--ak-layer-parent) ak-layer-darken-0
```

The same applies in CSS custom utilities when a `_checked` or `_disabled` state overrides the layer color but the `_idle` state set a darken:

```css
@utility my-check_idle {
  @apply ak-layer ak-layer-darken-6;
}
@utility my-check_checked {
  /* Must reset darken-0 since _idle's darken-6 is still on the element */
  @apply ak-layer ak-layer-(color:--my-color) ak-layer-darken-0;
}
```

### `ak-frame-*/[calc(...)]` arbitrary modifier generates invalid CSS

The `ak-frame-*` utility generates a `--spacing()` multiplication for arbitrary bracket modifiers, which can produce invalid `<length> × <length>` values. Workaround: use the frame preset without modifier and set the padding with `ak-frame-p-*`.

### Responsive `ak-frame-cover` overrides non-responsive `rounded-*!`

Tailwind v4 places responsive utilities after non-responsive utilities in the CSS output. If `ak-frame-cover` is already provided by a compound utility, don't re-apply it at a responsive breakpoint — it will override non-responsive `!important` border-radius overrides. Use only `ak-frame-p-*` for responsive padding changes.
