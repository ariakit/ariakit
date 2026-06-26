---
"@ariakit/react-components": minor
---

Removed `disableTreeOutside` from `dialog/utils/disable-tree`

**BREAKING** if you import `disableTreeOutside` from `@ariakit/react-components/dialog/utils/disable-tree`.

The helper was intended for internal dialog tree management and is no longer used now that modal [`Dialog`](https://ariakit.com/reference/dialog) components mark and disable outside elements in a single tree walk.

Before:

```ts
import { disableTreeOutside } from "@ariakit/react-components/dialog/utils/disable-tree";
```

After:

```ts
// No public replacement import is available.
```
