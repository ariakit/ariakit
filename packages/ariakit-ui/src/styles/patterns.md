# Style patterns

How the style files in this folder are built, and the rules that decide the shape of a change.

`layer.ts`, `frame.ts`, `text.ts` and `hover.ts` are the primitives. `list.ts` is the reference composite: it was rebuilt against every rule below, so when a rule is unclear, read that file.

These files ship to people who paste them into their own applications. That audience shapes several rules here, especially the ones about comments.

## Compose the primitives

Extend the primitive that owns the variants you need, then set defaults, instead of writing `ak-*` classes by hand.

```ts
const progressBase = cv({
  extend: [frame],
  defaultVariants: {
    $lightnessOffset: 2,
    $borderWeight: "adaptive",
    // A border would grow the track, so the edge is a ring drawn inside it.
    $borderType: "inset",
    $border: true,
    $rounded: "full",
    $p: "none",
  },
});
```

`frame` extends `layer`, so extending `frame` gives you the whole colour system plus borders, radius, padding and margin.

When two components share a set of defaults, put them on a private base and extend that. `progress` and `progressCircular` both extend `progressBase`.

Keep one path from a component to each primitive. A component that extends both `frame` and a base that also extends `layer` emits the layer classes twice, because every extend contributes its own full output.

A variant reached through `extend` never replaces a primitive's variant of the same name. Both run. To give a name a different meaning, the component has to declare it in its own `variants`, which a shared object can do through a spread. A function declared there replaces whatever the primitive had; a map merges key by key, so a new key joins the scale instead of hiding it.

```ts
// $border here publishes width channels for the cells. Extended, it would
// run alongside frame's $border, which would read a side keyword as a width.
export const tableContainer = cv({
  extend: [frame],
  variants: {
    ...tableBorderVariants,
  },
});
```

A map merges instead, so a new key joins the primitive's scale rather than replacing it. A caller can still pass `"2xl"` here and get frame's own class.

```ts
export const table = cv({
  extend: [frame],
  variants: { $rounded: { field: "ak-frame-(--radius-field)" } },
  defaultVariants: { $rounded: "field" },
});
```

Extend `frame` even when the element must not open a frame context. `$frame: false` only drops the `ak-frame` class; every border variant stays available.

```ts
// listItemMarker sets $frame: false, yet still extends frame, because it
// paints its bullet border and its empty ring with frame's $borderWeight.
export const listItemMarker = cv({
  extend: [frame],
  defaultVariants: { $frame: false /* ... */ },
});
```

Reach for a raw class only when a variant cannot express the rule. The two real cases are map variants (they emit a class, so they cannot be gated by a CSS condition) and any rule that must depend on CSS state.

Do not restate what a utility already does either. Tailwind's `before:` and `after:` variants set `content` to `""` themselves, so `after:content-['']` next to any other `after:*` class is dead weight.

## Variants write inline styles, classes carry CSS conditions

This is the constraint that explains most of the unusual code in this folder.

A function variant returns `{ class, style }`. The style lands in the `style` attribute, so no Tailwind variant can gate it, and it always beats a class.

That gives three techniques, in order of preference.

**Pass a `var()` through the variant.** The value stays one inline property, so a caller's own value still replaces it cleanly.

```ts
defaultVariants: {
  $p: "var(--list-item-padding)",
},
```

**Multiply by a published flag.** When a value must branch on CSS state, publish `1`/`0` flags and let a `calc()` in a computed default pick the branch. One inline style, no class per state.

```ts
$lightnessOffset(defaultValue, variants) {
  if (variants.$checked === true) return defaultValue;
  return (
    defaultValue ??
    `calc(var(--list-ol, 0) * ${ORDERED_MARKER_LIGHTNESS})`
  );
},
```

Give every flag a `, 0` fallback so the component still renders outside its container.

**Write the prefixed utility by hand.** Last resort, because it duplicates whatever maths the variant would have done and a caller's variant value then fights it by stylesheet order rather than replacing it.

## Tailwind only generates what it can read

Tailwind scans source text and generates a class only if it finds the candidate verbatim. An interpolated class name produces no CSS at all.

```ts
// Never. This emits nothing.
`[--list-marker-lightness:${ORDERED_MARKER_LIGHTNESS}]`;
```

Style values have no such limit. That is where named constants belong, which is another reason to prefer the `calc()` in a computed default over a class per state.

Name a value only when two places read it, or when the number needs explaining. A single-use literal reads better inline, and reaching for a round number often removes the need for a name at all.

## Prefer the named utility to an arbitrary property

An arbitrary property such as `[block-size:100%]` always emits, whatever you put in it. The named utility goes through Tailwind's scale, so it stays readable and keeps working when the theme changes.

```ts
// Instead of these
"[inline-size:var(--sidebar-min-width)]";
"[block-size:100%]";

// write these
"w-(--sidebar-min-width)";
"h-full";
```

The `(--var)` shorthand takes a fallback, and a leading `-` negates it, so an arbitrary property that only wrapped a channel almost always has a utility form.

```ts
// Instead of these
"[inset-block:var(--table-border-inset,0px)]";
"[inset-inline-start:calc(var(--table-border-s,0px)*-1)]";

// write these
"inset-y-(--table-border-inset,0px)";
"-inset-s-(--table-border-s,0px)";
```

Add a `length:` hint where the utility also takes a colour, or Tailwind reads the channel as one: `border-s-(length:--table-border-s,0px)`, `ring-(length:--border-width)`.

Logical utilities are not the ones with logical-sounding names. `inset-x` and `inset-y` are `inset-inline` and `inset-block`; `border-s`, `border-e`, `border-bs` and `border-be` are the logical border widths, while `border-t` and `border-b` are physical.

Where two core utilities do the same thing, follow the folder. It writes `inset-s-*`, not the older `start-*`.

Keep the value in brackets when the utility has no bare form for it. `h-[100cqb]` works and `h-100cqb` does not, and the failure is silent: Tailwind emits nothing and the element quietly falls back to its content size.

That silence is the reason to check a converted class in the browser. Toggle it off and confirm the computed value changes.

Converting a declaration also moves the property name. Anything that names the old one, such as a `transition-*` list or `will-change`, has to move with it.

## Deciding where a custom property lives

The root publishes state, and values derived from its own knobs that more than one descendant subtree reads. Everything else belongs on the component that consumes it.

Before moving a property down, check whether one of these pins it to an ancestor.

- A `@container style()` query reads it. Style queries match the nearest ancestor container, never the element that sets the property.
- An ancestor reads it. Custom properties inherit downward only, so a parent can never read a child's declaration.
- The root spends it on itself, such as `gap-(--list-gap)` on the element that lays out the rows.
- A nested instance must reset it, which only the root can do for its own subtree.

If none apply, and a single component (or a single shared base such as `listRow`) can derive the value locally from properties that already inherit to it, move it there.

Derived state with several readers is worth naming once on the root rather than repeating the derivation.

```ts
// Connectors join rows only in an ordered list in blocks mode. The
// connector segment and the disclosure indent both read this flag.
"[--list-connector:calc(var(--list-ol,0)*var(--list-blocks,0))]",
```

## Defaults

Put a default in `defaultVariants` unless a CSS rule has to re-derive it. A mode variant is a class, and a class cannot override an inline style, so knobs that mode variants recompute must start as classes.

```ts
// These two defaults must be classes, not $gap/$itemPadding defaults. The
// mode variants below re-derive them in CSS, which cannot override an
// inline style.
"[--list-gap-base:var(--list-gap-root,--spacing(4))]",
"[--list-item-padding:--spacing(1)]",
```

Computed defaults take `(defaultValue, variants)`. Honour `defaultValue`, so an extender can still set its own.

```ts
$borderWeight(defaultValue, variants) {
  if (variants.$checked === true) return defaultValue;
  return defaultValue ?? (variants.$checked === false ? 25 : "bold");
},
```

When the inherited default is a static value rather than `undefined`, `??` never fires. Guard on the value instead.

```ts
$layer(defaultValue, variants) {
  if (!variants.$checked) return defaultValue;
  // Replace only layer's own default. A more specific value, from an
  // extender or a color, was asked for deliberately.
  if (defaultValue !== true) return defaultValue;
  return "brand";
},
```

Three things worth knowing about how clava resolves these.

- Computed defaults see each other's results. Declaration order does not matter, because the refine chain re-runs until values settle.
- The `variants` snapshot carries every variant with a resolved value, including ones inherited through `extend`. `control` reads `variants.$p` this way and never declares `$p` itself.
- A prop the caller passed always wins over a computed default.

## Prefer an explicit state to `undefined`

A variant map with a `false` key gets an implicit static default of `false`. When a component has three states, name the third rather than clearing the default and deriving a second boolean variant from it.

```ts
$checked: {
  none: [ /* plain bullet or number, no check at all */ ],
  true: "before:hidden",
  false: "ui-list-ul:ring ui-list-ul:ring-inset",
},
```

```ts
$checked(_defaultValue, variants) {
  if (variants.$progress == null) return "none";
  return Number(variants.$progress) === 1;
},
```

Returning `undefined` from a computed default deletes the key, which is the supported way to clear an implicit default when no third state fits.

## Selectors

Self-nesting reads better as `[&_&]` than as a published flag plus a custom variant. The formatter normalises it to `[:is(&_&)]`.

```ts
"[:is(&_&)]:[--list-gap-base:calc(var(--list-gap-root,--spacing(4))*0.5)]",
```

For cross-component selection, give the root a plain marker class and select on it, the way `.control` already works. This removes both the flag and the `@custom-variant` a consumer would otherwise have to install.

```ts
// on the root
"list grid gap-(--list-gap) [counter-reset:list]",
// on a descendant, which may live in another file
"in-[.list]:pbs-[calc(var(--list-item-gap)-var(--ak-frame-padding))]",
```

Both idioms also win on specificity rather than on the order in which variants were registered, which removes a dependency that breaks silently when rules move.

Use a root-relative selector when the target element is markup the component does not own.

```ts
// A disclosure row is a div inside a bare li, so a row rule would match
// :last-of-type on every row.
"[&>li:last-of-type]:[--list-last-row:1]",
```

## Units and inheritance

Derive line-based geometry from `1lh` instead of a custom property. It tracks whatever line height the element actually has.

```ts
"[--list-marker-size:calc(1lh-var(--list-marker-inset)*2)]",
```

Two inheritance rules decide whether that works.

A unitless `line-height` inherits as a ratio, so a child with a larger font size gets a taller line. A length inherits verbatim. When a component needs its own content and its decorations to agree on where the first line sits, freeze the ratio into a length on the shared parent. `lh` on the `line-height` property resolves against the parent, not itself.

```ts
// A row freezes the line height it inherits into a length, so every
// child keeps it. Without this a heading child scales the ratio by its
// own font size, and its first line stops lining up with the marker.
"leading-[1lh]",
```

`em` and `lh` inside an unregistered custom property resolve where the property is used, not where it is declared. Check the element that finally spends the value when a property crosses component boundaries.

Registration reverses that. A property registered with a `<length>` syntax, such as `--ak-frame-padding`, computes to a fixed length where it is declared, so its `em` stops tracking the font size of whatever finally spends it. That is the difference between the table's `$px`/`$py` and its `$p`: the per-axis channels are unregistered, so a smaller header row takes proportionally smaller padding and stops lining up with the column below it, while `$p` goes through the frame's registered channel and every cell gets the same length. Two properties that look interchangeable are not if only one of them is registered.

## Lightness values

`$lightnessOffset`, `$lightnessPush`, `$lighten` and `$darken` run on a scale of 5 per step, so `1` is a 5% shift and `0.5` is 2.5%.

Stay on multiples of `0.5`. A value such as `0.6` or `2.4` says nothing the nearest half step does not, and it makes two components that should sit on the same surface look accidentally different.

A raw `ak-layer-N` converts to `$lightnessOffset: N / 5`, so `ak-layer-3` is `0.6` and `ak-layer-12` is `2.4`. Snap the result onto a half step and compare the two surfaces in the browser.

```ts
defaultVariants: {
  $lightnessOffset: 0.5,
},
```

## Types

Use `(string & {})` only when the union also has string literals that must stay in autocomplete.

```ts
// Right: the literals survive alongside arbitrary strings.
$chroma(value?: ChromaValues | (string & {}) | number)

// Wrong: no literals, so the intersection does nothing.
$gap(value?: (string & {}) | number)

// Right.
$gap(value?: string | number)
```

Spell side and axis values the way CSS does. `"block-end"` reads on its own; `"b"` needs the reader to know whether it means block or bottom. Abbreviations belong on the custom properties, where matching the utility that spends them is what helps: `--table-border-bs` next to `border-bs-*`.

Route spacing props through `getSpacingValue`, and colour or scale props through `getScaledStyleClass`, `getLightnessStyleClass` or `getChromaStyleClass` in `../utils/styles.ts`.

## Comments

The reader owns this file and has never seen the repository it came from. Write for that person.

Drop a comment that references a system the reader never used, records a rejected alternative, or explains an internal placement decision. Drop anything that narrates what the code plainly says.

Keep, and tighten, a comment that carries something the code cannot say.

- A browser workaround, and which browsers.
- A cascade or stylesheet-order dependency that breaks silently when lines move.
- A non-obvious CSS mechanism, such as counter timing, style queries matching ancestors only, or inline style precedence.
- Why a magic value is that value.
- A warning that will bite whoever edits the line next.

Prefer one sentence, and usually no more than three `//` lines. Prefer a well named custom property to a comment that explains an expression.

## Verifying a change

Style changes are easy to get wrong in ways types do not catch.

Compare the emitted output directly, before and after, for every state a variant can take.

```
node --experimental-strip-types script.ts   # call cv.jsx({...}) and diff className + style
```

Confirm anything that depends on CSS semantics in a real browser, not by reasoning. Container queries, specificity, inheritance direction and unit resolution have all produced surprises here.

When a change should be comment-only or output-neutral, prove it: diff with comment lines excluded, or compare computed values on the page.
