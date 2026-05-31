---
"@ariakit/solid-utils": patch
"@ariakit/solid-store": patch
"@ariakit/solid-components": patch
"@ariakit/solid": patch
---

Solid `Checkbox` and store bindings

The [`Checkbox`](https://solid.ariakit.com/reference/checkbox), [`CheckboxProvider`](https://solid.ariakit.com/reference/checkbox-provider), and [`CheckboxCheck`](https://solid.ariakit.com/reference/checkbox-check) components and the [`useCheckboxStore`](https://solid.ariakit.com/reference/use-checkbox-store) store are now available in `@ariakit/solid`, along with the Solid store bindings ([`useStoreState`](https://solid.ariakit.com/reference/use-store-state)) in `@ariakit/solid-store`.

```tsx
import { Checkbox, CheckboxProvider } from "@ariakit/solid";

<CheckboxProvider defaultValue={["apple"]}>
  <Checkbox value="apple" />
</CheckboxProvider>;
```
