# @ariakit/solid-store

## 0.1.7

- Updated dependencies: `@ariakit/store@0.1.7`

## 0.1.6

- Fixed published packages omitting their build output. Thanks to [@shahednasser](https://github.com/shahednasser).
- Updated dependencies: `@ariakit/store@0.1.6`

## 0.1.5

- Fixed store subscriptions to respond consistently to updates made with `NaN` keys.
- Updated dependencies: `@ariakit/store@0.1.5`

## 0.1.4

### Fixed merged stores to keep values in sync when `sync` listeners update parent

stores during initialization, including composed stores used by
[`Select`](https://ariakit.com/reference/select) and
[`Combobox`](https://ariakit.com/reference/combobox).

### Other updates

- Fixed `sync` and `batch` to run a listener's pending cleanup before re-registering the same listener.
- Fixed `init` cleanups so repeated or stale calls do not rerun store setup teardowns.
- Fixed `createStore` to keep parent stores in sync when a parent listener rewrites a value during a multi-parent fan-out.
- Fixed store listener cleanup disposal so synchronous store updates during unsubscribe do not rerun detached listeners.
- Updated dependencies: `@ariakit/store@0.1.4`

## 0.1.3

- Fixed initialized child stores to avoid notifying listeners twice when they update shared parent state.
- Updated dependencies: `@ariakit/store@0.1.3`

## 0.1.2

- Fixed runtime `process.env.NODE_ENV` checks in published package output, including test-only behavior and development warnings.
- Updated dependencies: `@ariakit/store@0.1.2`

## 0.1.1

- Release artifacts now include npm trusted publishing provenance.
- Updated dependencies: `@ariakit/store@0.1.1`

## 0.1.0

### Added standalone utility and store packages

The shared utility and store helpers are now available as pure ESM packages with a single public entrypoint:

```ts
import { invariant } from "@ariakit/utils";
import { createStore } from "@ariakit/store";
import { useStoreState } from "@ariakit/react-store";
```

React consumers importing from `@ariakit/react` can continue to use `useStoreState` there. The standalone store packages are available for direct utility imports, and `@ariakit/react-components/store` exposes the React store helpers for component internals.

### Other updates

- Updated dependencies: `@ariakit/store@0.1.0`

## 0.0.0

Initial release.
