---
tags:
  - Command
---

# Command

<div data-description>

Click with a mouse or keyboard to trigger an action. This abstract component is based on the [WAI-ARIA Command Role](https://w3c.github.io/aria/#command).

</div>

<div data-tags></div>

<a href="../examples/command/index.tsx" data-playground>Example</a>

## API

```jsx
<Command />
```

## Command vs. Button

In summary, for a semantic button element, the [Button](/components/button) component is recommended.

The `Button` component operates on `Command` and inherits all its features. It also automatically adds the `role="button"` attribute when needed, such as when rendering a non-native button.

For a clickable element with a different semantic role, like `menuitem`, and if you're not using the specific Ariakit component like [`MenuItem`](/reference/menu-item), `Command` is your go-to option.
