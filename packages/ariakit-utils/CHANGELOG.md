# @ariakit/utils

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
