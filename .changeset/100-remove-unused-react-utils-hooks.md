---
"@ariakit/react-utils": minor
---

Removed unused React utility hooks

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
