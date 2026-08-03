---
"@ariakit/react-components": patch
"@ariakit/react": patch
---

Explicitly undefined props no longer override computed defaults

Passing `undefined` to a component prop now behaves exactly like omitting it, so the component keeps the value it computes for itself.

This mainly affects wrapper components that forward optional props positionally, which is the common way to wrap an Ariakit component:

```tsx
function MyHovercard({ autoFocusOnShow, ...props }: MyHovercardProps) {
  return <Ariakit.Hovercard autoFocusOnShow={autoFocusOnShow} {...props} />;
}
```

Rendering `<MyHovercard />` no longer forces [`autoFocusOnShow`](https://ariakit.com/reference/hovercard#autofocusonshow) to `true` on [`Hovercard`](https://ariakit.com/reference/hovercard), so hovering the anchor stops pulling keyboard focus into the card. The same applies to every prop a component computes for itself, including [`focusable`](https://ariakit.com/reference/tab-panel#focusable) on [`TabPanel`](https://ariakit.com/reference/tab-panel), [`clickOnEnter`](https://ariakit.com/reference/checkbox#clickonenter) on [`Checkbox`](https://ariakit.com/reference/checkbox), and `children`, `role`, `type` and `aria-*` fallbacks, so it is worth auditing wrappers that forward props positionally.

An explicitly defined value still wins, so `<Hovercard autoFocusOnShow={false} />` keeps working as before.
