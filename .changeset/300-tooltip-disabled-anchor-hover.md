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

An anchor that is [`disabled`](https://ariakit.com/reference/focusable#disabled) without [`accessibleWhenDisabled`](https://ariakit.com/reference/focusable#accessiblewhendisabled) still keeps its content closed on hover, since that content would otherwise be reachable by pointer users alone. This rule now holds in every composition order as well. Previously, an anchor that received the disabled props from a component it renders could open its content on hover when the rendered element was not a native form control and the consumer had restored pointer events on it.

This holds even when the anchor turns disabled while a delayed tooltip is still pending, which previously opened over a control the keyboard could no longer reach.

Only a disabled state that Ariakit itself resolves closes the content this unconditional way. An anchor that renders a component declaring `aria-disabled` on its own keeps showing its content on hover, as before.

Whether a trigger counts as disabled at all is now read from the rendered element too, the way [`MenuButton`](https://ariakit.com/reference/menu-button) already decides whether to respond to focus and key presses. Since a disabled [`MenuButton`](https://ariakit.com/reference/menu-button) doesn't open its menu on hover by default, one that renders a component declaring `aria-disabled` on its own no longer opens it either.

Opening a menu is an activation rather than a reveal, so by default a disabled [`MenuButton`](https://ariakit.com/reference/menu-button) does not open its menu on hover, whether or not it stays keyboard accessible. This now holds wherever the disabled props are declared: a [`MenuButton`](https://ariakit.com/reference/menu-button) that received [`accessibleWhenDisabled`](https://ariakit.com/reference/focusable#accessiblewhendisabled) and [`disabled`](https://ariakit.com/reference/focusable#disabled) through [`render`](https://ariakit.com/guide/composition) used to open its menu on hover.
