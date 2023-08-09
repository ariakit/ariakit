---
tags:
  - Popover
  - Dropdowns
  - Concurrent React
---

# Lazy Popover

<div data-description>

Lazy loading <a href="/components/popover">Popover</a> using <a href="https://react.dev/reference/react/lazy"><code>React.lazy</code></a> and <a href="https://react.dev/reference/react/useTransition"><code>React.useTransition</code></a> to avoid downloading additional code until the user interacts with the button.

</div>

<div data-tags></div>

<a href="./index.tsx" data-playground>Example</a>

## Controlling the popover state

You can control the open state of the popover by passing the [`open`](/reference/use-popover-store#open) and [`setOpen`](/reference/use-popover-store#setopen) props to the [`usePopoverStore`](/reference/use-popover-store) hook:

```js
const [open, setOpen] = React.useState(false);
const popover = Ariakit.usePopoverStore({ open, setOpen });
```

Learn more on the [Component stores](/guide/component-stores#controlled-state) guide.
