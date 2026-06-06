# Ariakit Test

**Important:** This package is experimental and does not follow semantic versioning, meaning breaking changes may occur in patch and minor versions.

Utilities for simulating user interactions in Ariakit's unit and end-to-end tests.

## Contents

- [Installation](#installation)
- [Usage](#usage)
- [API reference](#api-reference)
- [React API reference](#react-api-reference)
- [Playwright API reference](#playwright-api-reference)
- [Core Team](#core-team)
- [Contributing](#contributing)

## Installation

```sh
npm i @ariakit/test
```

## Usage

Import helpers from the package root to simulate user interactions:

```ts
import { click, press, type } from "@ariakit/test";
```

The `@ariakit/test/react` entry point renders React components for testing, and the `@ariakit/test/playwright` entry point provides query helpers for Playwright tests.

<!-- ariakit-docs:start -->

## API reference

- [`blur`](#blur)
- [`click`](#click)
- [`dispatch`](#dispatch)
- [`focus`](#focus)
- [`hover`](#hover)
- [`mouseDown`](#mousedown)
- [`mouseUp`](#mouseup)
- [`press`](#press)
- [`query`](#query)
- [`q`](#q)
- [`select`](#select)
- [`sleep`](#sleep)
- [`tap`](#tap)
- [`type`](#type)
- [`waitFor`](#waitfor)

### `blur`

```ts
function blur(element?: DirtiableElement | null): Promise<void>;
```

Removes focus from an element, simulating a real user moving focus away from it. When no element is passed, the currently focused element (`document.activeElement`) is used. If the element was typed into since it gained focus, a `change` event is dispatched before it's blurred.

Example:

```ts
await type("hello", q.textbox());
// Dispatches the pending `change` event, then blurs the textbox.
await blur();
```

<div align="right">
  <a href="#api-reference">&uarr; back to top</a>
</div>

### `click`

```ts
function click(
  element: Element | null,
  options?: PointerEventInit,
  tap = false,
): Promise<void>;
```

Clicks on an element, simulating the sequence of events a real mouse click produces — hovering the target, then `pointerdown`, `mousedown`, `focus`, `pointerup`, `mouseup`, and `click`.

Hidden and disabled elements are handled the same way a browser would, and clicks on labels, `option` elements, and form controls behave like native interactions. Pass `options` to set event properties such as modifier keys (e.g. `{ shiftKey: true }`).

Example:

```ts
await click(q.button("Submit"));
// With a modifier key held down:
await click(q.option("Item"), { shiftKey: true });
```

<div align="right">
  <a href="#api-reference">&uarr; back to top</a>
</div>

### `dispatch`

```ts
type Target = Document | Window | Node | Element | null;

type EventFunction = (element: Target, options?: object) => Promise<boolean>;

type EventsObject = {
  [K in EventType]: EventFunction;
};

const dispatch: typeof baseDispatch & EventsObject;
```

Creates and fires a DOM event on an element, then waits for the resulting microtasks to flush. Call `dispatch.<eventName>(element, options)` to build and fire a specific event (e.g. `dispatch.keyDown`, `dispatch.click`, `dispatch.input`), or call `dispatch(element, event)` directly with an `Event` instance.

Unlike higher-level helpers such as `click` and `type`, this fires a single event without simulating the surrounding interaction sequence. Pointer and mouse events fired on an element with `pointer-events: none` are re-dispatched on the nearest ancestor that has pointer events enabled, matching how browsers route those events.

Returns: A promise that resolves to `false` when the event's default action was prevented with `event.preventDefault()`, and `true` otherwise.

Example:

```ts
await dispatch.keyDown(q.textbox(), { key: "Enter" });
await dispatch.click(q.button());
// Fire a custom event instance directly:
await dispatch(q.textbox(), new Event("selectstart", { bubbles: true }));
```

<div align="right">
  <a href="#api-reference">&uarr; back to top</a>
</div>

### `focus`

```ts
function focus(element: Element | null): Promise<void>;
```

Moves focus to an element, simulating a real user focusing it. Elements that aren't focusable are ignored, and focusing the already focused element is a no-op. If another element was typed into since it gained focus, its pending `change` event is dispatched before focus moves.

Example:

```ts
await focus(q.textbox());
expect(q.textbox()).toHaveFocus();
```

<div align="right">
  <a href="#api-reference">&uarr; back to top</a>
</div>

### `hover`

```ts
function hover(
  element: Element | null,
  options?: PointerEventInit,
): Promise<void>;
```

Moves the pointer over an element, simulating a real user hovering it. Fires the relevant `pointer`/`mouse` enter, over, and move events, and dispatches the matching leave events on the previously hovered element.

Hidden elements and elements with `pointer-events: none` are handled the way a browser would. Pass `options` to set event properties such as modifier keys.

Example:

```ts
await hover(q.button("More options"));
expect(q.menu()).toBeVisible();
```

<div align="right">
  <a href="#api-reference">&uarr; back to top</a>
</div>

### `mouseDown`

```ts
function mouseDown(
  element: Element | null,
  options?: PointerEventInit,
): Promise<void>;
```

Presses the primary pointer button down on an element, firing `pointerdown` and `mousedown` and moving focus the way a browser would. Disabled elements still receive `pointerdown` but not `mousedown`, and focus falls back to the closest focusable ancestor when the target itself isn't focusable.

This is one step of a full `click`; use it directly to test press-and-hold behavior. Pass `options` to set event properties such as modifier keys.

Example:

```ts
await mouseDown(q.button("Resize"));
// ...assert the press state, then release:
await mouseUp(q.button("Resize"));
```

<div align="right">
  <a href="#api-reference">&uarr; back to top</a>
</div>

### `mouseUp`

```ts
function mouseUp(
  element: Element | null,
  options?: PointerEventInit,
): Promise<void>;
```

Releases the primary pointer button on an element, firing `pointerup` and `mouseup`. Disabled elements still receive `pointerup` but not `mouseup`.

This is the counterpart to `mouseDown` and one step of a full `click`. Pass `options` to set event properties such as modifier keys.

Example:

```ts
await mouseDown(q.button("Resize"));
await mouseUp(q.button("Resize"));
```

<div align="right">
  <a href="#api-reference">&uarr; back to top</a>
</div>

### `press`

```ts
function press(
  key: string,
  element?: Element | null,
  options: KeyboardEventInit = {},
): Promise<void>;
```

Presses a key on an element, simulating a real user keyboard interaction. Fires `keydown` and `keyup` and applies the browser's default behavior for that key — moving focus with `Tab`, activating buttons and submitting forms with `Enter`, clicking buttons, checkboxes, and radios with `Space`, moving the caret with the arrow and `Home`/`End` keys, and typing printable characters into text fields.

When no element is passed, the currently focused element is used. Shortcuts such as `press.Enter()` and `press.Tab()` are provided for common keys, and `press.ShiftTab()` moves focus backwards.

Example:

```ts
await press.Tab();
await press.Enter();
// `press.Enter(element)` is shorthand for `press("Enter", element)`:
await press.Enter(q.button("Submit"));
```

<div align="right">
  <a href="#api-reference">&uarr; back to top</a>
</div>

### `query`

```ts
type Query = ReturnType<typeof createRoleQuery>;

type TextQuery = ReturnType<typeof createTextQuery>;

type RoleQueries = Record<AriaRole, Query>;

interface QueryObject extends RoleQueries {
  text: TextQuery;
  labeled: TextQuery;
  within: (element?: HTMLElement | null) => QueryObject;
}

const query: QueryObject;
```

Queries the DOM by ARIA role, accessible name, text, or label, built on top of Testing Library. Call a role method such as `query.button(name)` or `query.dialog()` to get the matching element (or `null`), passing a string or `RegExp` to match its accessible name. Use `query.text()` and `query.labeled()` to query by text content or associated label, and `query.within(element)` to scope queries to a subtree.

Every query also exposes `.lazy` (return a reusable function that runs the query when called), `.all` (return all matches), `.wait` (resolve once the element appears), and `.ensure` (throw when it's missing) variants, and role queries additionally expose `.hidden` to include otherwise-hidden elements.

Example:

```ts
const dialog = query.dialog.lazy("Settings");
expect(dialog()).not.toBeInTheDocument();
await click(query.button("Open settings"));
expect(dialog()).toBeVisible();
// Wait for an element to appear, or scope a query to a subtree:
await query.alert.wait();
query.within(dialog()).button("Close");
```

<div align="right">
  <a href="#api-reference">&uarr; back to top</a>
</div>

### `q`

```ts
type Query = ReturnType<typeof createRoleQuery>;

type TextQuery = ReturnType<typeof createTextQuery>;

type RoleQueries = Record<AriaRole, Query>;

interface QueryObject extends RoleQueries {
  text: TextQuery;
  labeled: TextQuery;
  within: (element?: HTMLElement | null) => QueryObject;
}

const q: QueryObject;
```

Short alias for `query`. Queries the DOM by ARIA role, accessible name, text, or label.

Example:

```ts
const dialog = q.dialog.lazy("Settings");
expect(dialog()).not.toBeInTheDocument();
await click(q.button("Open settings"));
expect(dialog()).toBeVisible();
```

<div align="right">
  <a href="#api-reference">&uarr; back to top</a>
</div>

### `select`

```ts
function select(
  text: string,
  element: Element | null = document.body,
  options?: PointerEventInit,
): Promise<void>;
```

Selects a range of text within an element, simulating a real user dragging across it. Hovers and presses on the element, finds the given `text` in its descendant text nodes, sets the document selection to cover it, then releases.

When no element is passed, `document.body` is used. Pass `options` to set event properties such as modifier keys.

Example:

```ts
await select("hello world");
expect(document.getSelection()?.toString()).toBe("hello world");
```

<div align="right">
  <a href="#api-reference">&uarr; back to top</a>
</div>

### `sleep`

```ts
function sleep(ms = defaultMs): Promise<void>;
```

Waits for the DOM to settle between simulated interactions by yielding across two animation frames and a short timeout.

The other helpers in this package call it internally, but you can await it directly to let pending updates, transitions, or effects flush before asserting. The default delay is small and environment-dependent; pass `ms` to override it.

Example:

```ts
await click(q.button("Open"));
await sleep();
expect(q.dialog()).toBeVisible();
```

<div align="right">
  <a href="#api-reference">&uarr; back to top</a>
</div>

### `tap`

```ts
function tap(
  element: Element | null,
  options?: PointerEventInit,
): Promise<void>;
```

Clicks on an element without the brief delay that `click` waits between pressing and releasing, reproducing the timing of a quick tap. It fires the same pointer, mouse, and click events as `click`. Pass `options` to set event properties such as modifier keys.

Example:

```ts
await tap(q.button("Submit"));
```

<div align="right">
  <a href="#api-reference">&uarr; back to top</a>
</div>

### `type`

```ts
function type(
  text: string,
  element?: (DirtiableElement & HTMLElement) | null,
  options: InputEventInit | KeyboardEventInit = {},
): Promise<void>;
```

Types text into an element, simulating a real user pressing each key. Focuses the element, then for each character fires `keydown`, updates the value and caret position of text fields through an `input` event (preceded by `keypress` when inserting a printable character), and fires `keyup`.

Special characters map to their keys: `"\b"` is Backspace, `"\x7f"` is Delete, `"\n"` is Enter, and `"\t"` is Tab. When no element is passed, the currently focused element is used. Pass `options` to set event properties such as modifier keys or composition state.

Example:

```ts
await type("Hello", q.textbox());
// Delete the last character with a Backspace:
await type("\b");
```

<div align="right">
  <a href="#api-reference">&uarr; back to top</a>
</div>

### `waitFor`

```ts
function waitFor<T>(
  callback: () => T,
  options?: DOMTestingLibrary.waitForOptions,
): Promise<T>;
```

Re-runs a callback until it stops throwing or the timeout is reached, re-exporting Testing Library's `waitFor` with this package's async batching applied. Use it to wait for an assertion to pass after an asynchronous update. Pass `options` to configure the `timeout`, `interval`, and other behavior.

Example:

```ts
await click(q.button("Close"));
await waitFor(() => expect(q.dialog()).not.toBeInTheDocument());
```

<div align="right">
  <a href="#api-reference">&uarr; back to top</a>
</div>

<!-- ariakit-docs:end -->

<!-- ariakit-docs:start react -->

## React API reference

- [`RenderOptions`](#renderoptions)
- [`render`](#render)

### `RenderOptions`

```ts
interface RenderOptions extends Omit<
  ReactTestingLibrary.RenderOptions,
  "queries"
> {
  strictMode?: boolean;
}
```

Options for the `render` function. Accepts every option from Testing Library's `render` (except `queries`), plus `strictMode` to wrap the rendered UI in React's `StrictMode`.

Example:

```tsx
const options: RenderOptions = { strictMode: true };
await render(<App />, options);
```

<div align="right">
  <a href="#react-api-reference">&uarr; back to top</a>
</div>

### `render`

```ts
function render(
  ui: ReactNode,
  options?: RenderOptions,
): Promise<{
  unmount: () => void;
  rerender: (newUi: ReactNode) => Promise<void>;
}>;
```

Renders a React element into the document for testing, waiting for effects and the next frame to flush before resolving.

Built on Testing Library's `render`, it returns `unmount` to remove the tree and an async `rerender` to update it with new UI. Pass `strictMode: true` to wrap the element in React's `StrictMode`, or any other Testing Library render option.

Example:

```tsx
const { rerender, unmount } = await render(<Button>Submit</Button>);
await click(q.button("Submit"));
await rerender(<Button>Sent</Button>);
unmount();
```

<div align="right">
  <a href="#react-api-reference">&uarr; back to top</a>
</div>

<!-- ariakit-docs:end react -->

<!-- ariakit-docs:start playwright -->

## Playwright API reference

### `query`

```ts
type RoleQuery = (
  name?: string | RegExp,
  options?: Parameters<Page["getByRole"]>[1],
) => Locator;

type TextQuery = (
  name: Parameters<Page["getByText"]>[0],
  options?: Parameters<Page["getByText"]>[1],
) => Locator;

type RoleQueries = Record<AriaRole, RoleQuery>;

type Queries = RoleQueries & { text: TextQuery };

function query(locator: Page | Locator | FrameLocator): Queries;
```

Creates role- and text-based query helpers for a Playwright `Page`, `Locator`, or `FrameLocator`. Call a role method such as `query(page).button(name)` to get a `Locator` from `getByRole`, or `query(page).text(name)` to match by text content.

Names are matched exactly by default. This mirrors the role-based `query` from the package root for end-to-end Playwright tests.

Example:

```ts
const { button, dialog } = query(page);
await button("Open").click();
await expect(dialog()).toBeVisible();
```

<div align="right">
  <a href="#playwright-api-reference">&uarr; back to top</a>
</div>

<!-- ariakit-docs:end playwright -->

## Core Team

- [Diego Haz](https://bsky.app/profile/haz.dev)
- [Ben Rodri](https://bsky.app/profile/ben.ariakit.org)
- [Dani Guardiola](https://bsky.app/profile/dio.la)

## Contributing

Follow the instructions on the [contributing guide](https://github.com/ariakit/ariakit/blob/main/contributing.md).
