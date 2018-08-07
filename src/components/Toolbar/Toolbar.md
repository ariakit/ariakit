`Toolbar` is a generic bar that works as a wrapper for titles and actions. It's usually positioned on the top of a page, but can be used in several ways, including vertically.

```jsx
import { Button, Heading, Link } from "reakit";
import MenuIcon from "react-icons/lib/md/menu";

<Toolbar background="white">
  <Toolbar.Content>
    <Toolbar.Focusable as={Button}>
      <MenuIcon />
    </Toolbar.Focusable>
  </Toolbar.Content>
  <Toolbar.Content area="center">
    <Heading fontSize={24} margin={0}>ReaKit</Heading>
  </Toolbar.Content>
  <Toolbar.Content area="end">
    <Toolbar.Focusable 
      as={[Button, Link]} 
      href="https://github.com/reakit/reakit"
      target="_blank"
    >
      GitHub
    </Toolbar.Focusable>
  </Toolbar.Content>
</Toolbar>
```

If you pass in a `vertical` prop, the toolbar content will be vertically aligned:

```jsx
import { Button, Heading, Link } from "reakit";
import MenuIcon from "react-icons/lib/md/menu";
import CreateIcon from "react-icons/lib/md/create";

<Toolbar background="white" vertical>
  <Toolbar.Content>
    <Toolbar.Focusable as={Button}>
      <MenuIcon />
    </Toolbar.Focusable>
    <Toolbar.Focusable as={Button}>
      <CreateIcon />
    </Toolbar.Focusable>
  </Toolbar.Content>
</Toolbar>
```

## Accessibility

`Toolbar` follows all the rules of [WAI-ARIA Practices 1.1](https://www.w3.org/TR/wai-aria-practices-1.1/#toolbar), which means

- It has `role="toolbar"`.
- You can use the arrow keys to change focus between [ToolbarFocusable](/components/toolbar/toolbarfocusable) components.
- It'll remember the last focused element. That is, when moving focus back to Toolbar, it'll select the element that was focused before you left.
