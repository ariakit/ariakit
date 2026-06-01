# @ariakit/utils

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
