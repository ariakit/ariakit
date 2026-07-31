---
"@ariakit/react-components": patch
---

Added `centerIntoView`

The `centerIntoView` utility centers an element within a containing scroll boundary without changing scroll positions outside that boundary:

```ts
import { centerIntoView } from "@ariakit/react-components/combobox/center-into-view";

centerIntoView(item, popover);
```
