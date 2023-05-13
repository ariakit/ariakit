---
"@ariakit/react-core": patch
"@ariakit/react": patch
---

The `Tooltip` component now defaults to use `aria-describedby` instead of `aria-labelledby`. ([#2279](https://github.com/ariakit/ariakit/pull/2279))

If you want to use the tooltip as a label for an anchor element, you can use the `type` prop on `useTooltipStore`:

```jsx
useTooltipStore({ type: "label" });
```
