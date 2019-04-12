---
path: /docs/toolbar
redirect_from:
  - /components/toolbar
---

# Toolbar

```jsx
import {
  Button,
  Menu,
  MenuDisclosure,
  MenuItem,
  useMenuState,
  Group,
  Toolbar,
  ToolbarItem,
  ToolbarSeparator,
  useToolbarState
} from "reakit";

function Example() {
  const toolbar = useToolbarState();
  const menu = useMenuState();
  return (
    <Toolbar {...toolbar}>
      <ToolbarItem {...toolbar}>Item 1</ToolbarItem>
      <ToolbarItem {...toolbar}>Item 2</ToolbarItem>
      <ToolbarSeparator {...toolbar} />
      <ToolbarItem {...toolbar}>Item 3</ToolbarItem>
      <Group>
        <ToolbarItem as={Button} {...toolbar}>
          Item 4
        </ToolbarItem>
        <ToolbarItem as={MenuDisclosure} {...menu} {...toolbar}>
          Item 5
        </ToolbarItem>
        <Menu {...menu}>
          <MenuItem {...menu}>Item 1</MenuItem>
          <MenuItem {...menu}>Item 2</MenuItem>
          <MenuItem {...menu}>Item 3</MenuItem>
        </Menu>
      </Group>
      <ToolbarSeparator {...toolbar} />
      <ToolbarItem {...toolbar}>Item 6</ToolbarItem>
    </Toolbar>
  );
}
```

```jsx
import {
  Toolbar,
  ToolbarItem,
  ToolbarSeparator,
  useToolbarState
} from "reakit";

function Example() {
  const toolbar = useToolbarState({ orientation: "vertical" });
  return (
    <Toolbar {...toolbar}>
      <ToolbarItem {...toolbar}>Item 1</ToolbarItem>
      <ToolbarItem {...toolbar}>Item 2</ToolbarItem>
      <ToolbarSeparator {...toolbar} />
      <ToolbarItem {...toolbar}>Item 3</ToolbarItem>
    </Toolbar>
  );
}
```

## Props

<!-- Automatically generated -->

### `useToolbarState`

| Name | Type | Description |
|------|------|-------------|
| <strong><code>orientation</code>&nbsp;</strong> | <code title="&#34;horizontal&#34; &#124; &#34;vertical&#34; &#124; undefined">&#34;horizontal&#34;&nbsp;&#124;&nbsp;&#34;vertical&#34;&nbsp;&#124;...</code> | Defines the orientation of the rover list. |
| <strong><code>unstable_currentId</code>&nbsp;⚠️</strong> | <code>string&nbsp;&#124;&nbsp;null</code> | The current focused element ID. |
| <strong><code>unstable_loop</code>&nbsp;⚠️</strong> | <code>boolean</code> | If enabled, the next item after the last one will be the first one. |

### `Toolbar`

| Name | Type | Description |
|------|------|-------------|
| <strong><code>orientation</code>&nbsp;</strong> | <code title="&#34;horizontal&#34; &#124; &#34;vertical&#34; &#124; undefined">&#34;horizontal&#34;&nbsp;&#124;&nbsp;&#34;vertical&#34;&nbsp;&#124;...</code> | Defines the orientation of the rover list. |

### `ToolbarItem`

| Name | Type | Description |
|------|------|-------------|
| <strong><code>disabled</code>&nbsp;</strong> | <code>boolean&nbsp;&#124;&nbsp;undefined</code> | Same as the HTML attribute. |
| <strong><code>unstable_focusable</code>&nbsp;⚠️</strong> | <code>boolean&nbsp;&#124;&nbsp;undefined</code> | When an element is `disabled`, it may still be `focusable`. In this case, only `aria-disabled` will be set. |
| <strong><code>orientation</code>&nbsp;</strong> | <code title="&#34;horizontal&#34; &#124; &#34;vertical&#34; &#124; undefined">&#34;horizontal&#34;&nbsp;&#124;&nbsp;&#34;vertical&#34;&nbsp;&#124;...</code> | Defines the orientation of the rover list. |
| <strong><code>unstable_currentId</code>&nbsp;⚠️</strong> | <code>string&nbsp;&#124;&nbsp;null</code> | The current focused element ID. |
| <strong><code>unstable_stops</code>&nbsp;⚠️</strong> | <code>Stop[]</code> | A list of element refs and IDs of the roving items. |
| <strong><code>unstable_register</code>&nbsp;⚠️</strong> | <code title="(id: string, ref: RefObject&#60;HTMLElement&#62;) =&#62; void">(id:&nbsp;string,&nbsp;ref:&nbsp;RefObject...</code> | Registers the element ID and ref in the roving tab index list. |
| <strong><code>unstable_unregister</code>&nbsp;⚠️</strong> | <code>(id:&nbsp;string)&nbsp;=&#62;&nbsp;void</code> | Unregisters the roving item. |
| <strong><code>unstable_move</code>&nbsp;⚠️</strong> | <code>(id:&nbsp;string&nbsp;&#124;&nbsp;null)&nbsp;=&#62;&nbsp;void</code> | Moves focus onto a given element ID. |
| <strong><code>unstable_next</code>&nbsp;⚠️</strong> | <code>()&nbsp;=&#62;&nbsp;void</code> | Moves focus onto the next element. |
| <strong><code>unstable_previous</code>&nbsp;⚠️</strong> | <code>()&nbsp;=&#62;&nbsp;void</code> | Moves focus onto the previous element. |
| <strong><code>unstable_first</code>&nbsp;⚠️</strong> | <code>()&nbsp;=&#62;&nbsp;void</code> | Moves focus onto the first element. |
| <strong><code>unstable_last</code>&nbsp;⚠️</strong> | <code>()&nbsp;=&#62;&nbsp;void</code> | Moves focus onto the last element. |
| <strong><code>stopId</code>&nbsp;</strong> | <code>string&nbsp;&#124;&nbsp;undefined</code> | Element ID. |

### `ToolbarSeparator`

| Name | Type | Description |
|------|------|-------------|
| <strong><code>orientation</code>&nbsp;</strong> | <code title="&#34;horizontal&#34; &#124; &#34;vertical&#34; &#124; undefined">&#34;horizontal&#34;&nbsp;&#124;&nbsp;&#34;vertical&#34;&nbsp;&#124;...</code> | Separator's context orientation. The actual separator's oriention will be flipped based on this prop. So a `"vertical"` orientation means that the separator will have a `"horizontal"` orientation. |
