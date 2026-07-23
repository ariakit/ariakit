# @ariakit/react-store

## 0.1.8

- Updated dependencies: `@ariakit/utils@0.1.5`, `@ariakit/react-utils@0.2.3`, `@ariakit/store@0.1.7`

## 0.1.7

- Fixed published packages omitting their build output. Thanks to [@shahednasser](https://github.com/shahednasser).
- Updated dependencies: `@ariakit/react-utils@0.2.2`, `@ariakit/store@0.1.6`

## 0.1.6

This version adds keyed selector subscriptions to reduce updates from unrelated state changes, lowers React store subscription overhead, and fixes unnecessary controlled `NaN` callbacks and subscriptions with `NaN` keys.

### Keyed object store subscriptions

The `useStoreStateObject` hook now accepts selector dependency keys, so selectors skip unrelated store updates while receiving the complete store state at runtime. The key list must include every store key a selector reads, or its result may stay stale.

```ts
const values = useStoreStateObject(store, ["value"], {
  value: "value",
  valueLength: (state) => state.value.length,
});
```

### Keyed store subscriptions

The [`useStoreState`](https://ariakit.com/reference/use-store-state) hook now accepts selector dependency keys, so selectors skip unrelated store updates while receiving the complete store state at runtime. The key list must include every store key a selector reads, or its result may stay stale.

```ts
const isEmpty = useStoreState(store, ["value"], (state) => !state.value);
```

React components now use keyed selector subscriptions internally.

### Other updates

- Reduced React store subscription overhead by skipping listeners when setter callbacks are absent and reading four related [`DisclosureContent`](https://ariakit.com/reference/disclosure-content) state values through one subscription, including in [`TabPanel`](https://ariakit.com/reference/tab-panel) and [`Dialog`](https://ariakit.com/reference/dialog) components.
- Fixed controlled `NaN` values from unnecessarily firing setter callbacks in React stores, including [`useCheckboxStore`](https://ariakit.com/reference/use-checkbox-store) and [`useRadioStore`](https://ariakit.com/reference/use-radio-store).
- Fixed store subscriptions to respond consistently to updates made with `NaN` keys.
- Updated dependencies: `@ariakit/store@0.1.5`, `@ariakit/react-utils@0.2.1`

## 0.1.5

- Fixed [`CompositeItem`](https://ariakit.com/reference/composite-item) and components built on it, such as [`Tab`](https://ariakit.com/reference/tab) and [`SelectItem`](https://ariakit.com/reference/select-item), crashing the app with a "Maximum update depth exceeded" error when a `NaN` value was passed to the `aria-posinset` or `aria-setsize` props. The `useStoreStateObject` hook now compares snapshot values with `Object.is`, so the fix also covers any direct consumer of that hook.

## 0.1.4

- Fixed React package sourcemaps so generated mappings account for the `"use client"` directive.
- Updated dependencies: `@ariakit/react-utils@0.2.0`, `@ariakit/utils@0.1.4`, `@ariakit/store@0.1.4`

## 0.1.3

- Updated dependencies: `@ariakit/utils@0.1.3`, `@ariakit/react-utils@0.1.3`, `@ariakit/store@0.1.3`

## 0.1.2

- Fixed runtime `process.env.NODE_ENV` checks in published package output, including test-only behavior and development warnings.
- Updated dependencies: `@ariakit/store@0.1.2`, `@ariakit/utils@0.1.2`, `@ariakit/react-utils@0.1.2`

## 0.1.1

- Release artifacts now include npm trusted publishing provenance.
- Updated dependencies: `@ariakit/utils@0.1.1`, `@ariakit/store@0.1.1`, `@ariakit/react-utils@0.1.1`

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

- Updated dependencies: `@ariakit/utils@0.1.0`, `@ariakit/store@0.1.0`, `@ariakit/react-utils@0.1.0`

## 0.0.0

Initial release.
