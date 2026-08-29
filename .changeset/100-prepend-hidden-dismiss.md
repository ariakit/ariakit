---
"@ariakit/react-components": minor
---

Removed `dialog/utils/prepend-hidden-dismiss`

**BREAKING** if you import `prependHiddenDismiss` from `@ariakit/react-components/dialog/utils/prepend-hidden-dismiss`.

Modal dialogs render their visually hidden dismiss button next to the dialog now, instead of prepending it into the dialog element, so this module no longer exists.

Before:

```ts
import { prependHiddenDismiss } from "@ariakit/react-components/dialog/utils/prepend-hidden-dismiss";
```

After:

```ts
// No replacement. The dialog renders the button on its own.
```
