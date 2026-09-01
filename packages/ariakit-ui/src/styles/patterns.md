# Style patterns

How the style files in this folder are built, and the rules that decide the shape of a change.

`layer.ts`, `edge.ts`, `frame.ts`, `text.ts` and `hover.ts` are the primitives. `list.ts` is the reference composite: it was rebuilt against every rule below, so when a rule is unclear, read that file.

These files ship to people who paste them into their own applications. That audience shapes several rules here, especially the ones about comments.

## Compose the primitives

Extend the primitive that owns the variants you need, then set defaults, instead of writing `ak-*` classes by hand.

```ts
const progressBase = cv({
  extend: [frame],
  defaultVariants: {
    $lightnessOffset: 2,
    $edgeWeight: "adaptive",
    // A border would grow the track, so the edge is a ring drawn inside it.
    $borderType: "inset",
    $border: true,
    $rounded: "full",
    $p: "none",
  },
});
```

`frame` extends `edge`, which extends `layer`, so extending `frame` gives you the whole colour system plus borders, radius, padding and margin.

`edge` owns the hairline colour that borders, rings, shadows and dividers all read. It extends `layer`, because the colour it tunes is derived by the layer utility on the same element and none of its channels inherit, so an element with no layer of its own gets nothing from them. Extend `edge` when an element needs those colours without frame geometry.

When two components share a set of defaults, put them on a private base and extend that. `progress` and `progressCircular` both extend `progressBase`.

Keep one path from a component to each primitive. A component that extends both `frame` and a base that also extends `layer` emits the layer classes twice, because every extend contributes its own full output. The chain makes that trap deeper, not shallower: anything reaching `frame` already has `edge` and `layer`, so `extend: [edge, button]` emits both sets twice.

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

Two maps merge instead, so a new key joins the primitive's scale rather than replacing it. A key of the same name does not shadow the primitive's, though: both entries emit. Declare one only to add to what the primitive already does for that key.

That merge is map to map, and only that. An extender's map replaces a primitive's function, and so does an extender's function, so a scale another component re-declares cannot simply be turned into one. `frame`'s `$rounded` was, to let it take a computed radius, and every named step went quiet on the components that add a key to it. Nothing failed loudly: `$rounded: "lg"` on a control slot just stopped emitting.

To let a scale take an arbitrary value, publish its resolver beside it and have every component that re-declares the name call the resolver for what it does not handle itself.

```ts
// frame.ts publishes both the scale and the way to resolve it.
export function getFrameRoundedClass(value?: FrameRoundedValue | (string & {})) {
  /* a named step, otherwise the radius channel */
}

// controlSlot adds `auto`, and spells out that its `full` is a pill on top of
// frame's own radius: the frame radius shrinks to stay concentric, and
// `rounded-full` sorts later and restores it.
$rounded(value?: FrameRoundedValue | "auto" | (string & {})) {
  if (value === "auto") return "ak-frame-m-(--my)";
  if (value === "full") return "ak-frame-full rounded-full";
  return getFrameRoundedClass(value);
},
```

Two things the resolver owes its callers. It has to ignore a bare word it does not recognise, because that word is another component's scale key rather than a value: without the guard, `$rounded: "auto"` on a component with no `auto` quietly emits `border-radius: auto`. And whatever the primitive's map used to contribute alongside an extender's key has to be spelled out by hand, since nothing merges any more.

The documentation goes the same way. A variant declared as a function replaces the primitive's JSDoc along with its behaviour, and the editor then shows only what the component wrote. A comment opening "Extends the control's radius values with `auto`" is accurate for a map, where both entries survive, and misleading for a function, where it is now the whole contract and leaves a reader no reason to think a named step or a length still works. Restate the full contract on every variant declared as a function.

Do not reach for the per-component theme tokens, `--radius-field`, `--spacing-card` and the rest. They are on their way out, and frame's own scale already covers them. `--radius-field` is `var(--radius-lg)`, so write `$rounded: "lg"`. `--spacing-field` is `0.75em`, which is `calc(var(--spacing) * 3)`, so write `$p: 3`, which also keeps tracking `--spacing` if a theme moves it.

An element that paints in the edge colour but takes no frame geometry extends `edge` instead. It gets the colour channels, and the layer they resolve against, without eleven frame props that do nothing for it.

```ts
// listItemMarker paints its bullet border and its empty ring with
// $edgeWeight, and positions itself against a frame padding it must not
// rewrite, so it takes the colours and none of the geometry.
export const listItemMarker = cv({
  extend: [edge],
});
```

The mirror case extends `frameBase`, which is `frame` with `edge` taken out from under it. An element that takes radius, padding or margin but paints nothing has no use for the layer `frame` would open, and where something above it already opened one, extending `frame` is the double-emit trap again.

```ts
// navDisclosureContentBody sits inside a disclosure body that already
// carries ak-layer, and paints nothing itself.
export const navDisclosureContentBody = cv({
  extend: [frameBase],
  defaultVariants: { $forceRounded: true, $p: "var(--nav-body-padding)" },
});
```

`$rounded` is a map of named steps, so a radius derived in CSS has no variant to pass through and still goes on by hand as `ak-frame-(--my-radius)`.

Keep `$frame: false` for the other case: an element that does take frame geometry from a shared base, but must not open a frame context of its own. `$frame: false` only drops the `ak-frame` class; every other frame variant stays available.

```ts
// progressCircularFill shares progressFillBase with the linear fill, and
// paints its own background and radius, so it must not round itself twice.
export const progressCircularFill = cv({
  extend: [progressFillBase],
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

The scan does not know what is code. A class name written in a comment generates CSS exactly like one on an element, so a note such as `// only apply cursor-pointer here` ships a stray `.cursor-pointer` rule. The same goes for any Markdown or fixture the source globs happen to cover; this file is excluded from the app's scan for that reason.

Ordinary prose trips this far more often than a quoted class name does. `inline`, `static`, `visible`, `hidden`, `outline`, `collapse`, `transform`, `transition`, `table` and `container` are all real utilities, so a comment that uses one as an English word ships its rule. Reach for another word, or name the family with a trailing `-*`: the scan drops the whole token, so `transition-*` and `ak-text-*` describe a group without shipping one.

Style values have no such limit. That is where named constants belong, which is another reason to prefer the `calc()` in a computed default over a class per state.

The editor needs the same thing through a different door. Tailwind IntelliSense only looks inside the calls listed in `tailwindCSS.classFunctions`, which this repo sets to `cv`, `clsx`, `cx`, `twMerge` and `twJoin`. A list inside a `cv()` config is covered, but the moment you hoist one out to share it between variants it becomes a plain array and loses completion, hover and the class-name diagnostics. Wrap it in `cx()` to get them back.

```ts
const gliderCover = cx(
  "m-(--inset-padding)",
  "inset-s-[anchor(start)] bottom-[anchor(bottom)]",
);
```

`cx` joins its arguments and does nothing else, so the emitted class string is unchanged. Nest the result where the array used to be spread: spreading a string spreads its characters.

Name a value only when two places read it, or when the number needs explaining. A single-use literal reads better inline, and reaching for a round number often removes the need for a name at all.

## Prefer the named utility to an arbitrary property

An arbitrary property such as `[block-size:100%]` always emits, whatever you put in it. The named utility goes through Tailwind's scale, so it stays readable and keeps working when the theme changes.

```ts
// Instead of these
"[inline-size:var(--sidebar-min-width)]";
"[block-size:100%]";
"[transition-behavior:allow-discrete]";

// write these
"w-(--sidebar-min-width)";
"h-full";
"transition-discrete";
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

That negating prefix wraps the whole value in another `calc(... * -1)`. Keep it over a scale step or a channel, where there is nothing to put a sign on: `-inset-4`, `-inset-s-(--table-border-s,0px)`. Once the value is in brackets, put the sign in the value.

```ts
// emits margin-top: calc(0.1875rem * -1)
"-mt-[0.1875rem]";

// emits margin-top: -0.1875rem
"mt-[-0.1875rem]";
```

Over a `calc()` you are already writing, the wrapper just nests.

```ts
// emits margin-inline-end: calc(calc(var(--inset-padding) * 2) * -1)
"-me-[calc(var(--inset-padding)*2)]";

// emits margin-inline-end: calc(-2 * var(--inset-padding))
"me-[calc(-2*var(--inset-padding))]";
```

Add a `length:` hint where the utility also takes a colour, or Tailwind reads the channel as one: `border-s-(length:--table-border-s,0px)`, `ring-(length:--border-width)`.

Logical utilities are not the ones with logical-sounding names. `inset-x` and `inset-y` are `inset-inline` and `inset-block`; `border-s`, `border-e`, `border-bs` and `border-be` are the logical border widths, while `border-t` and `border-b` are physical.

Where two core utilities do the same thing, follow the folder. It writes `inset-s-*`, not the older `start-*`. An old spelling survives a copy-paste, so check the lines you move as well as the ones you write.

Keep the value in brackets when the utility has no bare form for it. `h-[100cqb]` works and `h-100cqb` does not, and the failure is silent: Tailwind emits nothing and the element quietly falls back to its content size.

Bare forms belong to a utility, not to a value. One line box is `h-lh`, `min-h-lh` or `max-h-lh`, while `w-lh` and `size-lh` emit nothing, so a line-sized square stays `size-[1lh]`. It is the single line only: `h-2lh` emits nothing either.

That silence is the reason to check a converted class in the browser. Toggle it off and confirm the computed value changes.

Converting a declaration also moves the property name. Anything that names the old one, such as a `transition-*` list or `will-change`, has to move with it.

It moves the rule's sort position too. An arbitrary property sorts after every named utility, so one that was quietly winning a conflict starts losing it the moment it becomes the utility it always meant. Either leave the arbitrary property alone or mark the utility `!`, and say which in a comment.

```ts
// The disclosure button underneath sets its own duration-* with an
// arbitrary value, which sorts later and would otherwise halve every
// timing above.
"duration-(--sidebar-duration)!";
```

Tailwind IntelliSense offers these conversions, and it reads one declaration at a time. It knows nothing about the rule that used to lose to this one, and nothing about what a bare selector means in a variant, so open the page after accepting one.

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
$edgeWeight(defaultValue, variants) {
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

Which spelling depends on what the rule has to beat. `in-[.list]:` compiles to `:where(:is(.list)) &`, so the ancestor contributes no specificity and the rule still wins only by sorting later, which is enough for scoping. `[.nav_&]:` compiles to `.nav &`, which outweighs a plain utility on the same element, so reach for that one when the rule exists to override another.

```ts
// Scoping: nothing on the row competes for this padding.
"in-[.list]:pbs-[calc(var(--list-item-gap)-var(--ak-frame-padding))]",
// Overriding: the disclosure button sets its own gap on this element.
"[.nav_&]:gap-[calc(--spacing(3)+1px)]",
```

Either spelling beats a published flag plus a `@custom-variant`, which a consumer has to install and which sorts by the order the variants happened to be registered in.

An attribute selector in a variant position wants a variant, not brackets. Brackets there hold an arbitrary _selector_, and a bare one is a type selector, so `**:[data-open]:opacity-0` compiles to `:is(& *):is(data-open)` and matches no element ever. Write `**:data-open:opacity-0`.

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

One step is what `true` already means on all four, so write `true` rather than `1`. That leaves a number in a default only where someone chose a distance other than one step, which is the thing worth reading.

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

Give each side its own prop rather than overloading one prop with side keywords. `$border`, `$borderBlock` and `$borderBlockEnd` spell themselves, mix widths that a single keyword cannot, and read in the order CSS does. Declare the narrow ones after the broad one and clava layers them whatever order the caller passes.

Abbreviations belong on the custom properties, where matching the utility that spends them is what helps: `--table-border-bs` next to `border-bs-*`.

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

To find out whether a rule wins on specificity or only because Tailwind sorted it later, copy the rule it beats and append the copy after it. If the copy takes over, the win was positional. Put the copy inside `@layer utilities`: an unlayered rule beats every layered one whatever its specificity, so testing outside the layer says yes to everything.
