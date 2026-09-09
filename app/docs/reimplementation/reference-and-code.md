# Reference documentation, code highlighting, and hovercards

This section records behavior from the site before its removal. These are candidates for the future site. They do not require the same components, parser, data transport, styles, or third-party libraries.

Source baseline: [`73d5c8645`](https://github.com/ariakit/ariakit/commit/73d5c8645458823366c7163446a9211128cf4cae). Main source files: `app/src/lib/reference-tokenizer.ts`, `app/src/lib/reference-tokenizer.test.ts`, `app/src/lib/reference.ts`, `app/src/components/reference-*.astro`, `app/src/components/reference-*.react.tsx`, `app/src/components/code-block-content.astro`, `app/src/components/code-block-segments.astro`, and `app/src/tests/reference-hovercards-browser.ts`.

## Purpose

Readers can inspect an API without leaving the code or prose that uses it. A reference link opens the full API page when selected. Hovering the link can show a short reference or a specific API item. The code display can show syntax colors, selected text, selected lines, and changes from an earlier version together.

The new implementation must use the new package patterns. Old `ak-*` classes, React islands, regular-expression passes, and CSS dimensions are not requirements.

## Reference data and document structure

Use reference metadata as the source of API names, kinds, descriptions, types, defaults, deprecations, examples, and destinations. Do not derive these details from display text alone.

Reference kinds are component, function, and store. Reference items include component or store props, function parameters, store state keys, and returned object members.

The existing document groups metadata in this order:

1. Store state, when present.
2. Required props and optional props, when the function has one parameter named `props` with documented members.
3. Parameters for other parameter shapes.
4. Return value, when present.

Required and optional props have separate sections. Preserve metadata order within each section. A return value can be an object with documented members, or a type and description without members. Each form needs a useful display.

A full reference includes:

- API name and kind.
- Markdown description.
- Deprecation notice, with optional Markdown migration text.
- Code examples, each with its language, highlight metadata, and optional description.
- The applicable sections and their items.
- Links to sections and individual items.
- A table of contents when the page needs it.

A reference item includes its name, type, optional default value, deprecation notice, Markdown description, and code examples. A default such as `"false"` or `"0"` must remain visible. Type fragments can use grammar context to get correct syntax colors without displaying that context. For example, the old type display uses the invisible prefix `const type: `.

The old labels optionally display `<Disclosure>` for a component and `useDisclosureStore()` for a function or store. Item labels have no extra symbols. Kind colors can help distinguish labels, but the exact colors and punctuation style can change.

## Full references, compact references, and item partials

The existing site supports three presentations of the same metadata:

| Presentation      | Content                                                                       |
| ----------------- | ----------------------------------------------------------------------------- |
| Full reference    | Descriptions, examples, sections, and complete item details                   |
| Compact reference | API description and examples, followed by section headings and links to items |
| Standalone item   | One item's type, default, description, deprecation, and examples              |

Compact references omit the generic state tutorial and item-level table-of-contents entries. Their item links allow a reader to inspect more detail.

The old component index also has an inert reference summary. It displays only the first item from the first applicable section, or the first return-value section. It cannot receive interaction and does not duplicate the main `api` anchor. The future site may use a different summary.

The metadata has live-example IDs. A future display can resolve these IDs to real previews and show the example count. The old implementation is incomplete: every live-example ID renders the same hard-coded `checkbox-card` example. That behavior must not be copied.

## Reference destinations and link resolution

A link must identify the correct framework, API, and item. The old canonical forms are:

```text
/react/components/disclosure/disclosure/#api
/react/components/disclosure/disclosure/#prop-disabled
/react/components/disclosure/disclosure-store/#state-open
/react/components/disclosure/disclosure-store/#return-prop-get-state
```

The exact URL design can change. Preserve valid deep links or provide a migration strategy if existing URLs change.

Item IDs distinguish `prop`, `parameter`, `state`, and `return-prop`, followed by the slugified name. Do not link an item unless the reference metadata contains that item.

Existing URL helpers also accept some shortened item names and convert legacy `/reference/<slug>` links to React references. If guides retain old links, the future link layer needs equivalent resolution or the content must be migrated.

In prose, recognized reference links receive the API preview behavior. An explicit opt-out keeps an ordinary link. Unknown links remain ordinary links.

The old prose component strips an outer `<code>` wrapper, other inline markup, and excess whitespace from a recognized link's label. The future design should preserve a useful accessible name without accidentally displaying escaped HTML or duplicate code wrappers.

## Reference links inside source code

Use the selected framework to resolve names. A React and a Solid API can share a name and have different documented props. The existing Solid test uses `Separator` with `orientation`; it must resolve to the Solid metadata.

Only link documented API names and documented item names. Unknown names and missing references leave ordinary source text.

The existing tokenizer works on trimmed code. It returns line-relative, start-inclusive and end-exclusive character ranges, a destination, and a label kind. The replacement can use another representation, but it must preserve exact displayed text and source positions.

Support these source forms where they remain relevant to the new API:

| Source form                                              | Link target                                                |
| -------------------------------------------------------- | ---------------------------------------------------------- |
| `import { Disclosure } from "@ariakit/react"`            | Imported API                                               |
| `import { Disclosure as Trigger } from "@ariakit/react"` | Local alias `Trigger` links to `Disclosure`                |
| `<Trigger render />`                                     | Component name and documented `render` prop                |
| `<ak.DisclosureProvider defaultOpen />`                  | Component name and documented boolean prop                 |
| `ak.useDisclosureStore({ open, setOpen })`               | Store constructor and documented option keys               |
| `const store = useDisclosureStore()`                     | Store constructor; record the returned store's identity    |
| `const store = useDisclosureContext()`                   | Context hook; associate its result with the matching store |
| `useStoreState(store, "mounted")`                        | That store's `mounted` state item                          |
| `useStoreState(store, (state) => state.mounted)`         | That store's `mounted` state item                          |
| `store.getState()`                                       | That store's documented `getState` return member           |

For namespace syntax, link the API name rather than the namespace or punctuation. For an aliased named import, the old implementation links the local alias in both the import and its uses.

Both direct calls and namespace calls can have documented options in their first object argument. The following keys are relevant:

```tsx
useDisclosureStore({
  open,
  setOpen: (nextOpen) => setOpen(nextOpen),
});
```

Here, `open` and the key `setOpen` are option links. Callback parameters and values are not option links solely because they have the same name.

Also account for method syntax and comments around keys:

```tsx
useDisclosureStore({
  setOpen /* controlled setter */: setOpen,
  async setOpen(nextOpen) {
    return nextOpen;
  },
  get open() {
    return true;
  },
});
```

The existing tests cover ordinary methods, async methods, getters, and generators. The parser must distinguish an option's key from nested objects, method bodies, function parameters, strings, and comments. Braces or parentheses in comments must not terminate the option object.

State links must use the store passed to that exact call. A later call must not inherit an earlier call's store:

```tsx
const combobox = ak.useComboboxStore();
const disclosure = ak.useDisclosureStore();

ak.useStoreState(combobox, (state) => state.open);
ak.useStoreState(disclosure, "mounted");
```

The `open` link belongs to Combobox and `mounted` belongs to Disclosure. A single-argument `useStoreState(combobox)` call creates no state-key link and must not interfere with the next call.

Context hooks can return a known store. The old association maps `useXContext` to `useXStore`. Preserve the ability to resolve these returned stores if the future API still needs it; do not require name-based inference if metadata can express the relationship.

Property access such as `store.getState()` links only documented returned members. The identifier range must exclude the dot, parentheses, whitespace, and following punctuation.

## Avoiding false reference links

Import provenance matters. An identically named API from another package must not receive an Ariakit link:

```tsx
import * as rac from "react-aria-components";

<rac.Disclosure render />;
```

Neither `Disclosure` nor `render` is an Ariakit reference here.

Existing tests also require:

- No component links on closing JSX tags.
- No component link on a function declaration.
- No JSX link on a TypeScript generic parameter such as `Example<Disclosure>()`.
- No Ariakit links on a locally defined function when the snippet has unrelated imports.
- Empty reference collections and unrelated code produce no links.

The old site supports import-free documentation fragments. A known name in `<Disclosure />` or `Ariakit.useComboboxStore()` can resolve without an import. This fallback helps short snippets. Its scope should be explicit in the rewrite so ordinary local names do not become false links.

## Style-reference links

The old tokenizer also detects `ak-*` classes in `class` and `className` attributes. It searches quoted values, strings inside expressions such as `clsx(...)`, static template segments, and `className` object properties.

It recognizes multiple classes and Tailwind modifiers:

```tsx
<div className={clsx("ak-button", active && "hover:ak-primary")} />
```

The intended link text is `ak-button` or `ak-primary`, without the modifier prefix. Colons inside arbitrary-value brackets or parentheses must not be treated as modifier boundaries.

Style references are independent of component provenance. A non-Ariakit component can use an Ariakit style.

This feature is unfinished: all class links currently point to `#`. The future site will use new style patterns. Do not preserve placeholder links or require recognition of `ak-*`. Decide which new style declarations have documentation, then link only those with valid destinations.

The intended template behavior is to link complete static style tokens and skip dynamic expressions. The old implementation is inconsistent across template forms, so its parsing details are not a reliable contract.

## Syntax colors and source fidelity

Support explicit languages and filename-based language selection. The current language set includes JavaScript, TypeScript, JSX, TSX, CSS, HTML, JSON, Bash, Python, and plain text. Unknown filenames fall back to plain text. Names such as `npm`, `pnpm`, `yarn`, and `bun` identify shell commands.

Syntax colors support light and dark themes. Reference links inherit their code token color. A link must not erase syntax colors or change spacing.

Code must survive HTML transport without changes. Existing tests specifically preserve entity-like text:

```tsx
fetch("/api?page=1&copy=2");
<span>5 &times; 3</span>;
```

The displayed and copied text must preserve literal ampersands and entity spellings. Before/after code transport must also preserve Unicode.

Reference ranges and highlighted text can start or end inside a syntax token or span several tokens. Their boundaries must not duplicate, omit, or reorder characters. Merge compatible adjacent or overlapping ranges to avoid duplicate links and nested anchors.

Repeated signatures occur in many reference partials. Keep build and render costs reasonable. Shared immutable results, memoization, or another approach can meet this need; WeakMaps and reference-array identity are not required.

## Selected lines and text

Authors can mark lines and text within a code block.

- Line numbers and selected-line inputs are one-based.
- A plain text selection string marks every occurrence in the snippet.
- A text selection can instead specify zero-based occurrence indices.
- Occurrence counting spans the full code block, not each line separately.
- Overlapping or touching text selections form one continuous marked region.
- A selection can cross syntax-token and line boundaries.

For example:

```tsx
highlightLines={[2, 4]}
highlightTokens={["setOpen", ["open", 0, 2]]}
```

This marks all occurrences of `setOpen`, and the first and third occurrences of `open`.

The old display gives a single-token selection a token-related color and a multi-token selection a neutral background. The future appearance can change, but selected text must remain clear and readable. References inside selected text must remain usable.

## Before/after code differences

A block can compare current code with `previousCode`.

The existing display:

- Preserves unchanged lines.
- Marks inserted and removed lines.
- Shows `+` and `-` indicators when a line difference needs them, even without line numbers.
- Uses the current code's line numbers for retained and inserted lines.
- Can show small replacements inline, with removed words and added words on the same displayed line.
- Can use separate removed and added lines for larger replacements.
- Can combine manual text selections, syntax colors, references, and difference marks.

Reference links belong to current code. Removed text must not receive a current-code link by mistake. In an inline difference, removed text does not advance the character offset into current code.

The old `preferMultilineDiff` setting controls the number of changed word segments permitted for inline rendering. Its boolean naming and numeric threshold are implementation choices. Preserve the ability to choose a readable comparison, not this exact heuristic.

Markdown authors can mark a preceding block with `previousCode`. The next block then displays the comparison. Optional adjacent `Before` and `After` paragraphs, with optional colons and case differences, are removed as presentation labels. The earlier block is not displayed separately.

## Code-block controls related to the content renderer

The surrounding code-block UI provides copying, optional filenames and icons, collapsible long code, file tabs, and optional previews.

Copy the original current code rather than rendered text, line numbers, removed text, or highlight markup.

A `maxLines` setting can collapse a long block. Expansion reveals the complete source. Horizontal scrolling must remain usable for long lines. The old code contains inconsistent boundary handling around collapsed lines, which must not become an acceptance rule.

If file tabs return, preserve the selected file and its scroll position as appropriate. A shared preference can select a package manager across install-command blocks. The old component limit of eight content slots is not a product requirement.

Syntax colors and reference links can be disabled independently. The old lightweight path also drops some text-selection and difference rendering when syntax colors are disabled. That coupling is an implementation limitation. The future design should make the desired fallback behavior explicit.

## Hovercard interaction and partial loading

Reference anchors remain navigable links. The hovercard adds an API preview.

The old interaction waits approximately 300 ms before showing and 150 ms before hiding. These delays reduce unwanted popups and permit movement from the anchor into the card. The exact values can change.

Load reference content on demand:

- Start a request when the user intends to inspect a reference.
- Show a loading state until the content is ready.
- Reuse content already loaded for the same destination.
- Avoid refetching because the window gains focus or a card remounts.
- Close the card if loading fails.
- Close open cards when page navigation starts.

The old endpoint mapping is:

```text
/react/components/disclosure/disclosure/#api
→ /partials/react/components/disclosure/disclosure/

/react/components/disclosure/disclosure/#prop-disabled
→ /partials/react/components/disclosure/disclosure/prop-disabled/
```

A full-API partial contains the compact reference. An item partial contains the standalone item. The partial receives the reference's framework context, including when rendering code inside it.

References inside a card can open another card. The old nested card opens to the right; a normal card opens below its anchor. Nested content must remain within the correct dialog and portal hierarchy. It must not be clipped or make the parent inaccessible.

Cards can contain long content, so they need bounded dimensions and scrolling. The old maximum heights, fixed width, arrow padding, colors, and frame classes are not requirements.

The old implementation renders fetched HTML and depends on lazy hydration. A pointer already on an anchor at hydration time may fail to open the card until it leaves and returns. That is a known implementation gap. Preserve the intended interaction, not the hydration race.

## Acceptance scenarios for the rewrite

Use the existing tokenizer tests as evidence for the listed regressions. Add visible interaction coverage when these features return.

1. A React and a Solid reference with the same name resolve to their own framework and documented items.
2. Aliased component and store imports link their local names correctly.
3. Namespace and direct JSX opening tags link only the component identifier and documented prop names.
4. Another library's identically named component receives no Ariakit API links.
5. Store options handle shorthand, methods, and comments without linking value-position identifiers.
6. Two stores with overlapping state names resolve each state read to the correct store.
7. A single-argument state read does not consume a later call's state key.
8. A context hook's returned store permits valid state and return-member links.
9. Function declarations, generic type parameters, closing tags, and unknown names remain ordinary code.
10. Selected text spanning several syntax tokens renders once, with its original text and working reference links.
11. Before/after rendering preserves Unicode and exact source text; inline deletions do not shift current-code links.
12. Full-reference and item partials return the expected content. The old browser test verifies a Disclosure partial and its `disabled` item.
13. Hovering a prose reference opens a dialog with fetched reference content. The old test follows the Disclosure description's `DisclosureContent` link and checks for `Optional Props`.
14. Nested reference inspection, loading, failure, and page navigation leave no unusable or orphaned card.
15. Copying a difference block produces the current code only.

## Limits of the old tokenizer

Do not carry these limits into the new design as requirements:

- Regular-expression import parsing is not a JavaScript module parser. Root and subpath imports receive uneven treatment.
- Type-only imports, mixed import forms, comments, and strings are not handled consistently across all passes.
- Store tracking uses variable names and fixed lookback windows. It has no lexical scope, reassignment, or shadowing model.
- First-argument detection and JSX prop scanning use heuristic boundaries. The JSX scan stops at the first `>`, even when syntax can contain another `>` inside a value.
- State selectors cover simple string keys and direct arrow member access. They do not establish support for arbitrary selector expressions.
- Class parsing has separate overlapping passes. Its intended treatment of static templates is stronger than its actual consistency.
- Framework omission can make same-name resolution depend on reference ordering.
- Output coalesces compatible overlaps but does not fully resolve conflicting overlaps.
- Placeholder `#` style links and hard-coded live examples are unfinished behavior.
- Colors, CSS classes, fixed sizes, fetch library, regular expressions, cache identity, HTML transport, hydration mode, and component file names are replaceable implementation details.
