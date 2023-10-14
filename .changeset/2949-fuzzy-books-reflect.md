---
"@ariakit/react-core": patch
"@ariakit/react": patch
---

The [Select](https://ariakit.org/components/select) component will now display the selected option(s) on the underlying native select element even when the corresponding [`SelectItem`](https://ariakit.org/reference/select-item) components aren't rendered.

This comes in handy when the [`SelectPopover`](https://ariakit.org/reference/select-popover) component is rendered dynamically (for instance, using the [`unmountOnHide`](https://ariakit.org/reference/select-popover#unmountonhide) prop) or a [`defaultValue`](https://ariakit.org/reference/select-provider#defaultvalue) is given without a matching [`SelectItem`](https://ariakit.org/reference/select-item) component.
