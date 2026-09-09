---
"@ariakit/components": patch
---

Shared HTML element list

The `elements` array is available from `@ariakit/components/role/role`. It contains the element names used by the React and Solid `Role` helpers, with a readonly tuple type that preserves each tag name.

```ts
import { elements } from "@ariakit/components/role/role";

type RoleElement = (typeof elements)[number];
```
