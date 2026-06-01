---
"@ariakit/react-components": minor
---

Removed `isValidElement` from `dialog/utils/walk-tree-outside`

**BREAKING** if you import `isValidElement` from `@ariakit/react-components/dialog/utils/walk-tree-outside`.

The helper was intended for internal dialog tree walking and has been removed from the public subpath exports to avoid confusion with React's `isValidElement`.

Before:

```ts
import { isValidElement } from "@ariakit/react-components/dialog/utils/walk-tree-outside";
```

After:

```ts
// No public replacement import is available.
```
