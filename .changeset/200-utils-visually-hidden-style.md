---
"@ariakit/utils": patch
---

DOM-compatible visually hidden styles

The new `getVisuallyHiddenStyle` utility exposes Ariakit's visually hidden styles from `@ariakit/utils`, so DOM-based packages can create elements that remain available to assistive technologies.

```ts
import { getVisuallyHiddenStyle } from "@ariakit/utils";

Object.assign(element.style, getVisuallyHiddenStyle());
```
