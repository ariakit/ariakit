---
"@ariakit/core": minor
"@ariakit/react-core": minor
"@ariakit/solid-core": minor
---

Removed core utility re-export paths

**BREAKING** if your code imports internal utility modules from `@ariakit/core`, `@ariakit/react-core`, or `@ariakit/solid-core` deep paths.

The old utility re-export paths have been removed in favor of the new standalone utility packages. React store utilities previously exposed through `@ariakit/react-core/utils/store` remain available from `@ariakit/react-core/store`, including `useStore`, `useStoreProps`, `useStoreState`, `useStoreStateObject`, and related types.

These core packages now publish ESM-only exports as part of the package split, so CommonJS `require()` calls for utility deep paths should be replaced with ESM imports from the new packages shown below.

Before:

```ts
import { invariant } from "@ariakit/core/utils/misc";
import { useEvent } from "@ariakit/react-core/utils/hooks";
import { useStoreState } from "@ariakit/react-core/utils/store";
import { createHook } from "@ariakit/solid-core/utils/system";
```

After:

```ts
import { invariant } from "@ariakit/utils";
import { useEvent } from "@ariakit/react-utils";
import { useStoreState } from "@ariakit/react-core/store";
import { createHook } from "@ariakit/solid-utils";
```
