`Button` is built from [Box](/components/primitives/box) with minimal default styles to support the many possible uses a button has.

It renders a `<div>` by default since that's more flexible than `<button>`. Proper ARIA attributes and event handlers are applied in order to guarantee accessibility (see the `HTML` tab below).

```jsx
<Button>Button</Button>
```

It has `display: inline-grid` and `grid-gap: 0.68em` by default, which means that you can put icons and other elements inside the button and they will be properly distributed within it. Here's an example using [react-icons](https://github.com/react-icons/react-icons):

```jsx
import Bell from "react-icons/lib/fa/bell";

<Button>
  <Bell />Bell
</Button>
```
