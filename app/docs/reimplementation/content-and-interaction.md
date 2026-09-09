# Content and interaction requirements for reimplementation

This document records behavior from the site before its removal. It is a handoff for a future implementation on the Ariakit UI package. It does not require the new site to retain all features, component names, styling, or implementation methods.

Historical source: [`73d5c8645`](https://github.com/ariakit/ariakit/commit/73d5c8645458823366c7163446a9211128cf4cae). Source paths below refer to that commit. [Fetch the pull request history](readme.md#read-archived-source) to read it in a fresh clone.

## Scroll behavior

### Horizontal scrolling

Sources: `app/src/components/horizontal-scroll.astro` and `app/src/components/horizontal-scroll-button.astro`.

User-visible behavior:

- Let a navigation row overflow horizontally without adding horizontal overflow to the page.
- Keep native touch, trackpad, and scrollbar scrolling available.
- Provide buttons with accessible names “Scroll left” and “Scroll right”.
- Scroll by a fraction of the visible container width. The current default is one half of that width.
- Use smooth scrolling for button actions.
- Show each button only when content remains in its direction. Recompute this state after scrolling, resizing, or content changes.
- Keep the current navigation item visible after navigation, with the restoration behavior described below.

Acceptance examples:

- In a 600-pixel container, the default right button advances approximately 300 pixels, subject to the end boundary.
- Content that fits shows no directional scroll controls.
- At the left boundary, only the right control can appear. At the right boundary, only the left control can appear.
- If new items create overflow, the controls update.
- If resizing removes overflow, both controls disappear.

Old implementation details, not required design:

- Astro page-load events initialize the behavior.
- A one-pixel tolerance determines scroll boundaries.
- Controls appear only at the `@3xl` container breakpoint.
- Gradients cover content behind the controls.
- Data attributes, observers, Tailwind class names, and the button appearance are replaceable.
- The current arithmetic assumes left-to-right scrolling. It does not establish a correct RTL requirement.
- Observer and event-listener cleanup is absent. Do not copy this limitation into the rewrite.

### Preserve scroll

Source: `app/src/components/preserve-scroll.astro`.

User-visible behavior:

- Save the scroll position of a selected region before a client-side navigation replaces the page.
- Restore the position on the matching region after replacement.
- Support horizontal, vertical, or both axes. Both axes is the current default.
- Preserve the destination region’s current position on axes that are not selected.
- Do nothing if no matching region or saved position exists.
- Support wrappers whose actual scrolling region is a child.

Acceptance examples:

- Save `(left: 80, top: 120)`, replace the region, and restore both coordinates.
- With horizontal preservation, restore `left: 80` while retaining the destination’s current `top`.
- When navigation removes the region, do not throw.
- On the first page load, do not force an unsaved position to zero.

Old implementation details:

- A CSS selector identifies the region.
- Its first `[data-scroll-container]` descendant takes precedence over the selected element.
- Astro’s `before-preparation` event saves; `after-swap` restores.
- State is held in the script instance. There is no history-entry storage or URL-keyed persistence.
- Restoration uses `scrollTo` with `behavior: "auto"`, with direct-property fallbacks.
- The rewrite must decide whether its navigation model needs per-region, per-route, or per-history-entry memory.

### Keep the current item visible

Source: `app/src/components/scroll-current-into-view.astro`.

User-visible behavior:

- Find the current item within a specified navigation region.
- Preserve the region’s prior scroll position across navigation, then make the new current item visible.
- Run on initial display and after navigation.
- Do not scroll a navigation region that is completely outside the viewport. This avoids moving the page to offscreen navigation.
- Do nothing if the region or current item is absent.
- Allow callers to select scroll behavior and horizontal/vertical alignment.

Current defaults:

```ts
{
  currentSelector: '[aria-current="page"]',
  behavior: "instant",
  inline: "nearest",
  block: "nearest",
}
```

Acceptance examples:

- A partly visible horizontal menu reveals its active link using the smallest movement.
- A menu completely below the viewport does not pull the page down.
- A restored menu position changes only as needed to reveal the new current item.

Old implementation detail: “visible region” means any intersection of its bounding rectangle with the viewport. This does not account for clipping by another ancestor.

### NoScroll

Source: `app/src/components/no-scroll.react.tsx`.

This component preserves document position through an Astro page swap. It is not a modal scroll lock.

Requirements to consider:

- Save both document scroll coordinates immediately before replacement.
- Restore them immediately after replacement only if the same persistent UI instance still exists.
- Use the UI instance’s owning document.
- Remove listeners when the instance unmounts.
- Add no visible or accessible content.

Acceptance example: a persistent UI region survives navigation while the document remains at `(left: 0, top: 600)`. Navigation to a page without that instance must not receive its old position.

Old implementation details: a React-generated ID and hidden marker determine persistence; Astro before/after-swap events trigger the work.

## Markdown and MDX

Sources: `app/src/components/markdown.astro`, `app/src/components/content-components.astro`, the `app/src/components/content-*` components, `app/src/lib/content.ts`, `app/src/lib/rehype.ts`, and `app/astro.config.ts`.

### Content rendering

- Render Markdown supplied as text for generated descriptions and reference content.
- Render MDX files for guides, component pages, and example pages.
- Preserve native semantics for headings, paragraphs, lists, links, separators, inline code, keyboard keys, fenced code, admonitions, and disclosures.
- Apply a shared content-component mapping where Markdown produces the elements.
- Keep explicit MDX component imports supported. They do not use the same mapping path as Markdown-generated elements.
- Render inline code independently from fenced code. A fenced block must remain identifiable as a `code` child of `pre`.
- Preserve heading levels and ordered/unordered list types when a generic mapped component renders them.
- Allow normal HTML attributes, IDs, and link destinations to survive rendering.

Current mapping:

| Markdown element | Current rendering role                          |
| ---------------- | ----------------------------------------------- |
| `a`              | Link with optional reference behavior           |
| `p`              | Paragraph                                       |
| `pre`            | Code-block renderer                             |
| `h1`–`h6`        | Heading with its original level                 |
| `ul`, `ol`       | List with its original type                     |
| `li`             | List item                                       |
| Inline `code`    | Code component                                  |
| `kbd`            | Keyboard-key component in already-rendered HTML |
| `admonition`     | Informational aside                             |
| `hr`             | Separator                                       |
| `details`        | Disclosure                                      |

The current inline-code plugin renames only inline `code` nodes to `inlinecode`. The heading/list plugin records the original tag in `as`. Neither mechanism is a required public API.

Acceptance example: ``A `value` is shown below`` produces inline code, while a fenced TypeScript block remains a distinct code block.

### Headings, admonitions, and disclosures

- MDX headings receive stable IDs and links to those IDs.
- GitHub-style admonition syntax identifies the type and an optional custom title.
- Remove the marker line from the visible body.
- Preserve any body text after the marker line, including text separated with a newline or `<br>`.
- Retain nested content such as lists and code blocks.
- Support the current accepted admonition types: note, tip, warning, and caution.
- Use a readable default title when no custom title exists.
- Render disclosures with a summary control and collapsible content.
- Honor authored `<details open>` as initially open.

Acceptance examples:

```md
> [!WARNING] Custom title
> Keep this body text.
```

The result has warning semantics, the title “Custom title”, and the body “Keep this body text.”

```html
<details open>
  <summary>More information</summary>
  <p>Initially visible.</p>
</details>
```

The summary remains the control label and the body starts visible.

Current component colors, icons, page widths, cards, and animation styling are replaceable.

### Links

- Keep ordinary links usable independently of reference hovercards.
- Recognize legacy reference URLs and convert them to the supported reference URL form when appropriate.
- Provide a way to disable automatic reference behavior.
- Derive the reference label from textual link content, including a single inline-code child.
- Classify links to the site as internal.
- Allow an explicit caller choice for opening a new window.
- If a link opens a new window, provide the corresponding external-link affordance.

Current details, not fixed policy:

- The implementation treats external HTTP(S), protocol-relative links, and other URI schemes as new-window links by default.
- It adds `noopener noreferrer nofollow` for those links.
- It uses a hard-coded set of Ariakit hosts.
- Its `"localhost:4321"` entry is compared against `URL.hostname`, which excludes the port. Do not preserve that mismatch.
- Reference hovercard behavior is covered by the separate reference handoff.

### Description extraction and repeated text rendering

The behavior in `app/src/lib/content.ts` remains useful without styled Markdown components:

- Derive plain-text metadata from the first non-empty rendered content block.
- Remove MDX import lines from this description input.
- Substitute the framework label in the supported framework expression.
- Unwrap `ContentLink` markup while preserving its text.
- Normalize whitespace.
- Reject unsupported MDX expressions instead of exposing raw `<`, `{`, or `}` content in metadata.
- Reuse results for repeated Markdown strings.
- Allow a failed render to be retried.

Acceptance example: a description containing a `ContentLink` around `Combobox` still yields the visible description text. Repeated inherited reference descriptions should not trigger thousands of duplicate transformations.

The current memoization uses a `Map<string, Promise<string>>`. Cache shape and lifetime are implementation choices.

### Boundary with the code-block handoff

The Markdown path also recognizes before/after blocks, line metadata, token metadata, filenames, and package-manager commands. Those requirements belong in the code-block handoff.

One simplification risk: `rehypePreviousCode` removes an authored “Before” block and passes its content to the following block. If a minimal renderer ignores that metadata, disable this transform too or the retained document silently loses content.

## Placeholders

### Placeholder text

Source: `app/src/components/placeholder-text.react.tsx`.

- Show a decorative text-shaped placeholder that has dimensions based on supplied text.
- Keep it hidden from assistive technology and prevent text selection.
- Support text size and visual weight variants.
- Support an explicit layer override.
- Prefer the `text` prop over string children when both are supplied.
- Produce no visible placeholder characters when neither input exists.

Acceptance example:

```tsx
<PlaceholderText weight="light" size="sm">
  john@example.com
</PlaceholderText>
```

The thumbnail shows a light placeholder with approximately that text’s footprint. Assistive technology does not announce the dummy address.

The current implementation draws a background for each character, makes the text transparent, and uses named layer classes. These are replaceable choices.

### Placeholder popover arrow

Source: `app/src/components/placeholder-popover-arrow.react.tsx`.

- Draw a decorative arrow that joins a static popover illustration.
- Support top, right, bottom, and left placement and a configurable size.
- Match the surrounding layer fill and edge color.
- Keep the visible border thickness consistent as the arrow scales.
- Avoid mask-ID collisions when multiple arrows appear.

Old defaults are a 30-pixel size and approximately two-pixel border. The current implementation uses Ariakit’s arrow path, SVG rotation, a mask, and a React-generated ID.

The current horizontal-centering classes apply to all directions. They do not prove a complete placement contract for side arrows.

## Portal root

Source: `app/src/lib/get-portal-root.ts`.

- Give site overlays a common portal destination outside local clipping and stacking contexts.
- Reuse the destination across tooltip and reference-hovercard instances.
- Create it only when needed.
- Attach it to the document that owns the originating UI.
- Keep overlay destination selection separate from tooltip and hovercard presentation.

Acceptance examples:

- Two overlays in one document share a destination.
- An overlay whose anchor is inside an iframe receives a destination inside that iframe document.
- Creating an iframe overlay does not select or create a portal in the parent document.

The original helper looks up and creates the root through the global `document`, then appends it through `node.ownerDocument`. This mixed-document behavior is a limitation to correct, not a requirement.

Only app tooltips and reference hovercards import this helper. Sandbox portal tests use package behavior, not this app helper.

## Online editor

Sources: `app/src/lib/stackblitz.ts`, `app/src/lib/stackblitz.dom.test.ts`, and `app/src/components/code-block-edit.react.tsx`.

### Supported projects and input

- Export a complete runnable project for React with Vite, React with Next.js, or Solid with Vite.
- Accept source files, runtime dependencies, development dependencies, optional compiler settings, theme, and an optional file to open first.
- Keep authored source files distinguishable from generated project infrastructure.
- Include the styling infrastructure that source files require.
- Fail clearly if no source entry exists or the framework is unsupported.
- Use a stable project title and description associated with the example.
- Prevent attempts to export projects whose dependencies cannot be installed.

Current framework inference:

```text
React + next dependency or app/ files -> React Next.js
React                                -> React Vite
Solid                                -> Solid Vite
```

The UI disables export for `@ariakit/ui` consumers because that package is private/unpublished at the historical source commit and the exported CSS does not include its full setup. A future exporter must solve distribution and styling before enabling this path.

### Source and dependency handling

- Include all source files and preserve their relative relationships.
- Normalize dependency subpath imports to package names, including scoped packages.
- Include the framework and build-tool dependencies required by the selected template.
- Keep generated tool versions consistent with the repository’s supported templates.
- Combine caller TypeScript options with required framework settings.
- Keep separate Next.js compiler overrides where Next.js needs a distinct configuration.
- Generate a Query provider when a React project needs `@tanstack/react-query`.

Acceptance examples:

- `@scope/package/subpath` becomes dependency `@scope/package`.
- A custom `compilerOptions.paths` field does not remove required module-resolution settings.
- A Solid project uses Solid JSX settings.
- A React Query example receives the provider needed to run.

Current details, not fixed contracts:

- Template dependency versions override caller versions for the same package.
- React Vite uses versions from `templates/react/package.json`.
- Several Solid/Next dependencies use `"latest"`.
- The first file in insertion order is the entry point.
- Vite files are placed under the last segment of the example ID; leading `../` segments are removed.
- Next.js page/layout entries are placed below `app/previews/<name>` and the root page redirects there.
- A normal React component is wrapped in a Next.js client page.
- Generated Next.js configuration skips build-time TypeScript and ESLint errors. That is not a requirement for the replacement.

### Open, embed, and source views

- Open an editor with the requested initial file.
- When no initial file is supplied, choose useful source files rather than generated infrastructure.
- Pass the requested editor theme.
- Support an embedded preview with the file explorer hidden.
- Size the embed to its containing region.
- Let a caller cancel an edit-button action through `preventDefault`.
- Keep the edit button unavailable when the project cannot be generated.
- Expose source files and theme-related generated files for other views when needed.

Current theme-file sets:

| Target           | Theme-related generated files      |
| ---------------- | ---------------------------------- |
| React/Solid Vite | `styles.css`, `index.html`         |
| React Next.js    | `app/styles.css`, `app/layout.tsx` |

Existing tests cover project compiler settings, framework entry generation, dependency versions, theme defaults, Query providers, source-only extraction, initial editor file forwarding, and embed options.

## Tags

Sources: `app/src/lib/tags.ts` and the collection, example, and component pages.

- Separate a stable tag ID from its display label.
- Allow framework restrictions.
- Ignore unknown or unavailable tags when resolving page metadata.
- Remove duplicate tag IDs while preserving their first occurrence order.
- Support listing all tags or only tags valid for a framework selection.
- Keep content-tag metadata separate from preview metadata.
- Support collection filtering and navigation by tag.
- Define clearly whether displayed counts measure documentation entries or previews/variants.

The current rule requires a restricted tag to support every requested framework, not merely one.

Acceptance examples:

```ts
getTag("nextjs", ["react"]); // Next.js tag
getTag("nextjs", ["solid"]); // null
getTag("nextjs", ["react", "solid"]); // null
mapTags(["forms", "forms", "bad"]); // one Forms tag
```

Current registry:

- Unrestricted: Plus, Dropdowns, Modals, Forms, No UI Library, Motion.
- React-only: Next.js, Next.js App Router, Ariakit React, Base UI, React Aria, Radix UI, React Router, React Toastify.
- Solid-only: Ariakit Solid.

Current collection pages generate an unfiltered route plus routes for tags present in the selected framework/type entries. Counts include matching preview variants. The new tag taxonomy, route design, entitlement meaning of Plus, and counting policy remain future design choices.
