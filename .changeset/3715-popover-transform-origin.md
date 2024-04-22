---
"@ariakit/react-core": patch
"@ariakit/react": patch
---

`--popover-transform-origin`

The [Popover](https://ariakit.org/components/popover) components now expose a [`--popover-transform-origin`](https://ariakit.org/guide/styling#--popover-transform-origin) CSS variable. You can use this to set the `transform-origin` property for the popover content element in relation to the anchor element:

```css
.popover {
  transform-origin: var(--popover-transform-origin);
}
```
