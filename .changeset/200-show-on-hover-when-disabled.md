---
"@ariakit/react-components": patch
"@ariakit/react": patch
---

New `showOnHoverWhenDisabled` prop

[`TooltipAnchor`](https://ariakit.com/reference/tooltip-anchor), [`HovercardAnchor`](https://ariakit.com/reference/hovercard-anchor), and [`MenuButton`](https://ariakit.com/reference/menu-button) now accept a [`showOnHoverWhenDisabled`](https://ariakit.com/reference/tooltip-anchor#showonhoverwhendisabled) prop that controls whether hovering can open the content element while the trigger is [`disabled`](https://ariakit.com/reference/focusable#disabled). Set it to `false` when revealing the content counts as activating the trigger rather than explaining it.

```tsx
<TooltipAnchor
  showOnHoverWhenDisabled={false}
  render={<Button disabled accessibleWhenDisabled />}
>
  Archive
</TooltipAnchor>
```

Like [`showOnHover`](https://ariakit.com/reference/tooltip-anchor#showonhover), it also accepts a callback receiving the mouse event, so the decision can depend on the trigger being hovered.

A disabled trigger that isn't [`accessibleWhenDisabled`](https://ariakit.com/reference/focusable#accessiblewhendisabled) never shows its content on hover, since that content would then be reachable by pointer users alone. This prop can't turn that back on.

[`MenuButton`](https://ariakit.com/reference/menu-button) defaults to `false` because opening a menu is an activation rather than an explanation. The other components default to `true`.
