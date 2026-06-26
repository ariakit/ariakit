# @ariakit/utils

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
