Menu allows you to display grouped navigation actions:

```jsx
import { Menu } from "reakit"

<Menu>
  <Menu.Item onClick={() => alert("Hello!")}>Item 1</Menu.Item>
  <Menu.Item>Item 2</Menu.Item>
  <Menu.Divider backgroundColor="#eee" />
  <Menu.Item>Item 3</Menu.Item>
  <Menu.Item disabled>Item 4 (disabled)</Menu.Item>
  <Menu.Item>Item 5</Menu.Item>
</Menu>
```

If you pass in a `horizontal` prop, the menu content will be vertically aligned:

```jsx
import { Menu } from "reakit"

<Menu horizontal>
  <Menu.Item onClick={() => alert("Hello!")}>Item 1</Menu.Item>
  <Menu.Item>Item 2</Menu.Item>
  <Menu.Divider backgroundColor="#eee" />
  <Menu.Item>Item 3</Menu.Item>
  <Menu.Item disabled>Item 4 (disabled)</Menu.Item>
  <Menu.Item>Item 5</Menu.Item>
</Menu>
```
