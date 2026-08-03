---
"@ariakit/react-utils": patch
"@ariakit/react-components": patch
"@ariakit/react": patch
---

Fixed [`Checkbox`](https://ariakit.com/reference/checkbox) and other components that use `render` to preserve computed props when a render element explicitly receives `undefined`. Explicit values, including `null`, continue to override computed props.

Thanks to [@Jackardios](https://github.com/Jackardios) for reporting the related `mergeProps` behavior that informed this fix.
