---
"@ariakit/react-utils": patch
"@ariakit/react-components": patch
"@ariakit/react": patch
---

Explicitly undefined props no longer override computed defaults

Passing `undefined` to a component prop now behaves exactly like omitting it, so the component keeps the value it computes for itself. Previously an own key holding `undefined` usually won over that computed value.

This mainly affects wrapper components that forward optional props positionally, which is the common way to wrap an Ariakit component:

```tsx
function MyHovercard({ autoFocusOnShow, ...props }: MyHovercardProps) {
  return <Ariakit.Hovercard autoFocusOnShow={autoFocusOnShow} {...props} />;
}
```

Rendering `<MyHovercard />` no longer forces [`autoFocusOnShow`](https://ariakit.com/reference/hovercard#autofocusonshow) to `true` on [`Hovercard`](https://ariakit.com/reference/hovercard), so hovering the anchor stops pulling keyboard focus into the card. The same applies to [`focusable`](https://ariakit.com/reference/tab-panel#focusable) on [`TabPanel`](https://ariakit.com/reference/tab-panel), which no longer becomes a stray tab stop, and to [`clickOnEnter`](https://ariakit.com/reference/checkbox#clickonenter) on [`Checkbox`](https://ariakit.com/reference/checkbox), where Enter no longer toggles a native checkbox.

An explicitly defined value still wins, so `<Hovercard autoFocusOnShow={false} />` keeps working as before.

The rule reaches every prop a component computes for itself without also accepting it as an option, including `children`, `value`, `role`, `type` and `aria-*` fallbacks, so it is worth auditing wrappers that forward props positionally. For example, `<Checkbox type={undefined} />` is now a real checkbox rather than a text input, and on [`Select`](https://ariakit.com/reference/select), `<Select>{undefined}</Select>` shows the selected value rather than an empty button.

If you were passing `undefined` to suppress a computed value, that no longer works on the component itself. Plain props on a non-Ariakit [`render`](https://ariakit.com/guide/composition) element are merged separately and still let `undefined` through today, but that is a known inconsistency rather than a supported way to drop a computed value, so prefer setting the value you want explicitly.
