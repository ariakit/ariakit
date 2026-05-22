---
"@ariakit/utils": minor
"@ariakit/store": minor
"@ariakit/react-utils": minor
"@ariakit/react-store": minor
"@ariakit/solid-utils": minor
"@ariakit/solid-store": minor
---

Added standalone utility and store packages

The shared utility and store helpers are now available as pure ESM packages with a single public entrypoint:

```ts
import { invariant } from "@ariakit/utils";
import { createStore } from "@ariakit/store";
import { useStoreState } from "@ariakit/react-store";
```

React consumers importing from `@ariakit/react` can continue to use `useStoreState` there. The standalone store packages are available for direct utility imports, and `@ariakit/react-components/store` exposes the React store helpers for component internals.
