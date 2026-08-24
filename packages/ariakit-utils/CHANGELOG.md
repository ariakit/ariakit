# @ariakit/utils

## 0.2.0

### `getActiveElement` takes an options object

**BREAKING** if you're passing a second argument to `getActiveElement`.

The second parameter is now an options object. Alongside `activeDescendant`, it accepts `frame`, which controls whether focus that lives inside a frame is resolved into that frame's document. It defaults to `true`, which is the previous behavior.

Before:

```ts
getActiveElement(element, true);
```

After:

```ts
getActiveElement(element, { activeDescendant: true });
```

Pass `frame: false` to stop the lookup at the given node's own document, which is what a caller needs when it decides ownership there, where focus inside a frame is represented by the frame element:

```ts
getActiveElement(element, { frame: false });
```

### `fireClickEvent` dispatches a `PointerEvent`

`fireClickEvent` now builds a `PointerEvent` from the window that owns the element, the way browsers dispatch a click, and reports `pointerId: -1` with an empty `pointerType` unless the caller passes a pointer. It previously built a `MouseEvent` from the ambient global, which dropped the pointer members its `PointerEventInit` parameter accepted and put the event in the wrong realm for an element inside a same-origin iframe. Where the environment has no `PointerEvent`, it still builds a `MouseEvent`, so activation keeps working and only the pointer members are dropped.

Every pointer attribute other than `pointerId` and `pointerType`, such as `pressure`, `width`, `tiltX`, `isPrimary`, and `persistentDeviceId`, is reported at its default value even when the caller passes it, which is what Pointer Events requires of a click.

### Other updates

- Fixed `fireClickEvent` so clicks use the target element's owner window for `view` and are composed.
- Fixed `getDocument` and `getWindow` reporting the ambient document and window for a document that belongs to another realm, such as the one inside a same-origin iframe.
- Fixed `fireEvent`, `fireBlurEvent`, `fireFocusEvent`, and `fireKeyboardEvent` building their events with the ambient window's constructors rather than those of the window that owns the element, so an event dispatched into a same-origin iframe belongs to that frame.
- Fixed `getActiveElement` reporting a form instead of the focused element when the document contains a form named `activeElement`.
- Fixed `getDocument` and `getWindow` trusting a member that a form or a document can answer with one of its own elements, so they now check what came back and fall back instead of returning a value of the wrong type, and typed `getWindow`'s result the way `document.defaultView` is so the interfaces a window carries can be read off it.

## 0.1.6

- Fixed components such as [`Button`](https://ariakit.com/reference/button) and [`Checkbox`](https://ariakit.com/reference/checkbox) copying inherited enumerable `Object.prototype` properties onto the element they render.
- Fixed components such as [`Button`](https://ariakit.com/reference/button) and [`Checkbox`](https://ariakit.com/reference/checkbox) treating values carried by a `__proto__` prop passed directly to them, such as one coming from parsed JSON, as props they were never given.

## 0.1.5

- Added a `warnOnce` utility that logs each warning once per message and optional object key. Thanks to [@ItaiYosephi](https://github.com/ItaiYosephi).

## 0.1.4

- Added `getItemRoleByPopupRole` to `@ariakit/utils` for resolving item roles from popup role strings.
- Fixed `getClosestFocusable` freezing the page in an infinite loop when walking up from an element that matched the focusable selector but was not actually focusable, such as a box-less `display: contents` element (reachable through `TagList`'s click handler).
- Fixed text field detection for elements rendered inside same-origin iframes. This fixes [`Composite`](https://ariakit.com/reference/composite) keyboard navigation for iframe text fields, including components built on it such as [`Toolbar`](https://ariakit.com/reference/toolbar), and prevents [`Command`](https://ariakit.com/reference/command) and [`Combobox`](https://ariakit.com/reference/combobox) from treating iframe text fields as non-text fields.
- Added `isInputEvent`.
- Fixed `queueBeforeEvent` so the cancel function removes the pending event listener as well as the queued timer.
- Fixed `getScrollingElement` to resolve the scroll container from the element's own document instead of the top-level page, so scroll-aware behavior works correctly for elements rendered inside a same-origin iframe.
- Fixed the `fallbackToFocusable` option of `getFirstTabbableIn`, `getAllTabbableIn`, and `getLastTabbableIn` to return focusable elements instead of every raw selector match, so the fallback no longer yields non-focusable elements such as a `display: none` input.

## 0.1.3

- Improved `getFirstTabbableIn` performance: it now returns as soon as it finds a tabbable element instead of collecting and checking every tabbable element in the container first.
- Improved the repeated-call performance of popup role helpers in `@ariakit/utils`.
- Renamed the `getPreviousTabbable` fallback parameter to `fallbackToLast` to match its behavior.
- Fixed `createUndoManager` to keep the undo stack within the configured limit after executing new actions.

## 0.1.2

- Added the `isElement` and `isNode` utilities that check whether an `EventTarget` is an element or a node.

## 0.1.1

- Release artifacts now include npm trusted publishing provenance.

## 0.1.0

### Added standalone utility and store packages

The shared utility and store helpers are now available as pure ESM packages with a single public entrypoint:

```ts
import { invariant } from "@ariakit/utils";
import { createStore } from "@ariakit/store";
import { useStoreState } from "@ariakit/react-store";
```

React consumers importing from `@ariakit/react` can continue to use `useStoreState` there. The standalone store packages are available for direct utility imports, and `@ariakit/react-components/store` exposes the React store helpers for component internals.

## 0.0.0

Initial release.
