---
"@ariakit/react-store": patch
"@ariakit/react-components": patch
"@ariakit/react": patch
---

Fixed [`CompositeItem`](https://ariakit.com/reference/composite-item) and components built on it, such as [`Tab`](https://ariakit.com/reference/tab) and [`SelectItem`](https://ariakit.com/reference/select-item), crashing the app with a "Maximum update depth exceeded" error when a `NaN` value was passed to the `aria-posinset` or `aria-setsize` props. The `useStoreStateObject` hook now compares snapshot values with `Object.is`, so the fix also covers any direct consumer of that hook.
