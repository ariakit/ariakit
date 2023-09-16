---
tags:
  - Popover
  - Dropdowns
  - Concurrent React
---

# Lazy Popover

<div data-description>

Lazy loading [Popover](/components/popover) using [`React.lazy`](https://react.dev/reference/react/lazy) and [`React.useTransition`](https://react.dev/reference/react/useTransition) to avoid downloading additional code until the user interacts with the button.


</div>

<div data-tags></div>

<a href="./index.tsx" data-playground>Example</a>

## Controlling the popover state

You can control the open state of the popover by passing the [`open`](/reference/popover-provider#open) and [`setOpen`](/reference/popover-provider#setopen) props to the [`PopoverProvider`](/reference/popover-provider) component:

```jsx
const [open, setOpen] = React.useState(false);

<PopoverProvider open={open} setOpen={setOpen}>
```

Learn more on the [Component stores](/guide/component-stores#controlled-state) guide.
