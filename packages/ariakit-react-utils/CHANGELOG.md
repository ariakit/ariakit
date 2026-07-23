# @ariakit/react-utils

## 0.2.3

- Updated dependencies: `@ariakit/utils@0.1.5`, `@ariakit/store@0.1.7`

## 0.2.2

- Fixed published packages omitting their build output. Thanks to [@shahednasser](https://github.com/shahednasser).
- Updated dependencies: `@ariakit/store@0.1.6`

## 0.2.1

- Updated dependencies: `@ariakit/store@0.1.5`

## 0.2.0

### Removed unused React utility hooks

**BREAKING** if you import `useLazyValue` or `usePreviousValue` from `@ariakit/react-utils`.

These hooks were not used by Ariakit packages and have been removed. Replace `useLazyValue` with `useInitialValue`, which accepts a lazy initializer. Inline the previous-value state pattern if you still need `usePreviousValue`.

Before:

```ts
import { useLazyValue, usePreviousValue } from "@ariakit/react-utils";

const set = useLazyValue(() => new Set());
const previous = usePreviousValue(value);
```

After:

```ts
import { useInitialValue } from "@ariakit/react-utils";
import { useState } from "react";

const set = useInitialValue(() => new Set());

const [previous, setPrevious] = useState(value);
if (value !== previous) {
  setPrevious(value);
}
```

### Other updates

- Fixed React package sourcemaps so generated mappings account for the `"use client"` directive.
- Updated dependencies: `@ariakit/utils@0.1.4`, `@ariakit/store@0.1.4`

## 0.1.3

- Fixed merged refs in React components and [`Portal`](https://ariakit.com/reference/portal) to preserve React 19 callback ref cleanup functions while still detaching refs that don't return a cleanup.
- Updated dependencies: `@ariakit/utils@0.1.3`, `@ariakit/store@0.1.3`

## 0.1.2

- Fixed runtime `process.env.NODE_ENV` checks in published package output, including test-only behavior and development warnings.
- Updated dependencies: `@ariakit/store@0.1.2`, `@ariakit/utils@0.1.2`

## 0.1.1

- Release artifacts now include npm trusted publishing provenance.
- Updated dependencies: `@ariakit/utils@0.1.1`, `@ariakit/store@0.1.1`

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

- Updated dependencies: `@ariakit/utils@0.1.0`, `@ariakit/store@0.1.0`

## 0.0.0

Initial release.
