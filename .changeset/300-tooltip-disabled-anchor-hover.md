---
"@ariakit/react-components": patch
"@ariakit/react": patch
---

Tooltip and Hovercard anchors respect `accessibleWhenDisabled` in any composition order

Hovering a disabled anchor that stays keyboard accessible now opens its [`Tooltip`](https://ariakit.com/reference/tooltip) or [`Hovercard`](https://ariakit.com/reference/hovercard) no matter where the disabled props are declared. Previously the hover decision was made before [`accessibleWhenDisabled`](https://ariakit.com/reference/focusable#accessiblewhendisabled) had been resolved, so it only worked when the props sat below [`TooltipAnchor`](https://ariakit.com/reference/tooltip-anchor) or [`HovercardAnchor`](https://ariakit.com/reference/hovercard-anchor), on a component the anchor renders. Declaring them on the anchor itself, or on a component that renders the anchor, left the tooltip closed on hover while keyboard focus still opened it.

```tsx
<Button disabled accessibleWhenDisabled render={<TooltipAnchor />}>
  Delete
</Button>
```

An anchor that is disabled without [`accessibleWhenDisabled`](https://ariakit.com/reference/focusable#accessiblewhendisabled) still keeps its content closed on hover, since that content would otherwise be reachable by pointer alone.

Opening a menu is an activation rather than a reveal, so a disabled [`MenuButton`](https://ariakit.com/reference/menu-button) never opens its menu on hover, whether or not it stays keyboard accessible. This now holds wherever the disabled props are declared: a [`MenuButton`](https://ariakit.com/reference/menu-button) that received [`accessibleWhenDisabled`](https://ariakit.com/reference/focusable#accessiblewhendisabled) and [`disabled`](https://ariakit.com/reference/focusable#disabled) through [`render`](https://ariakit.com/guide/composition) used to open its menu on hover.
