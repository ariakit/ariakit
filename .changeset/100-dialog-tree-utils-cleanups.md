---
"@ariakit/react-components": minor
---

Changed the cleanups of the dialog tree utilities

**BREAKING** if you import `markTreeOutside` from `@ariakit/react-components/dialog/utils/mark-tree-outside`, `markAndDisableTreeOutside` from `@ariakit/react-components/dialog/utils/disable-tree`, or the cleanup helpers from `@ariakit/react-components/dialog/utils/tree-cleanup`.

These helpers are intended for internal dialog tree management. `markTreeOutside` and `markAndDisableTreeOutside` now return their cleanups keyed by element instead of a restore function, and accept the cleanups of a previous call so that they can update the tree without restoring it first. Pass the returned cleanups to `restoreCleanups` to restore the tree. The `addElementMarkCleanup` and `addAncestorMarkCleanup` helpers now receive a `walk` from `startCleanupWalk` instead of a `cleanups` array.

Before:

```ts
import { markTreeOutside } from "@ariakit/react-components/dialog/utils/mark-tree-outside";

const restore = markTreeOutside(id, elements);
restore();
```

After:

```ts
import { markTreeOutside } from "@ariakit/react-components/dialog/utils/mark-tree-outside";
import { restoreCleanups } from "@ariakit/react-components/dialog/utils/tree-cleanup";

const cleanups = markTreeOutside(id, elements);
restoreCleanups(cleanups);
```

Thanks to [@jonastreub](https://github.com/jonastreub) for reporting the issue and proposing the approach that informed this solution.
