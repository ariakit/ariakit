---
path: /docs/toolbar
redirect_from:
  - /components/toolbar
---

# Toolbar

`Toolbar` follows the [WAI-ARIA Toolbar Pattern](https://www.w3.org/TR/wai-aria-practices/#toolbar). It's a containers for grouping a set of controls.

## Installation

```sh
npm install reakit
```

Learn more in [Get started](/docs/get-started).

## Usage

```jsx
import {
  useToolbarState,
  Toolbar,
  ToolbarItem,
  ToolbarSeparator
} from "reakit/Toolbar";
import { Button } from "reakit/Button";

function Example() {
  const toolbar = useToolbarState();
  return (
    <Toolbar {...toolbar}>
      <ToolbarItem {...toolbar} as={Button}>
        Item 1
      </ToolbarItem>
      <ToolbarItem {...toolbar} as={Button}>
        Item 2
      </ToolbarItem>
      <ToolbarSeparator {...toolbar} />
      <ToolbarItem {...toolbar} as={Button}>
        Item 3
      </ToolbarItem>
    </Toolbar>
  );
}
```

## Accessibility

- `Toolbar` has role `toolbar`.
- `ToolbarItem` extends the accessibility features of [Rover](/docs/rover).

Learn more in [Accessibility](/docs/accessibility).

## Composition

- `Toolbar` uses [Box](/docs/box).
- `ToolbarItem` uses [Rover](/docs/rover).
- `ToolbarSeparator` uses [Separator](/docs/separator).

Learn more in [Composition](/docs/composition#props-hooks).

## Props

<!-- Automatically generated -->

### `useToolbarState`

| Name | Type | Description |
|------|------|-------------|
| <strong><code>orientation</code>&nbsp;</strong> | <code title="&#34;horizontal&#34; &#124; &#34;vertical&#34; &#124; undefined">&#34;horizontal&#34;&nbsp;&#124;&nbsp;&#34;vertical&#34;&nbsp;&#124;...</code> | Defines the orientation of the rover list. |
| <strong><code>currentId</code>&nbsp;</strong> | <code>string&nbsp;&#124;&nbsp;null</code> | The current focused element ID. |
| <strong><code>loop</code>&nbsp;</strong> | <code>boolean</code> | If enabled:<br>  - Jumps to the first item when moving next from the last item.<br>  - Jumps to the last item when moving previous from the first item. |

### `Toolbar`

| Name | Type | Description |
|------|------|-------------|
| <strong><code>orientation</code>&nbsp;</strong> | <code title="&#34;horizontal&#34; &#124; &#34;vertical&#34; &#124; undefined">&#34;horizontal&#34;&nbsp;&#124;&nbsp;&#34;vertical&#34;&nbsp;&#124;...</code> | Defines the orientation of the rover list. |

### `ToolbarItem`

| Name | Type | Description |
|------|------|-------------|
| <strong><code>disabled</code>&nbsp;</strong> | <code>boolean&nbsp;&#124;&nbsp;undefined</code> | Same as the HTML attribute. |
| <strong><code>focusable</code>&nbsp;</strong> | <code>boolean&nbsp;&#124;&nbsp;undefined</code> | When an element is `disabled`, it may still be `focusable`. It works similarly to `readOnly` on form elements. In this case, only `aria-disabled` will be set. |
| <strong><code>orientation</code>&nbsp;</strong> | <code title="&#34;horizontal&#34; &#124; &#34;vertical&#34; &#124; undefined">&#34;horizontal&#34;&nbsp;&#124;&nbsp;&#34;vertical&#34;&nbsp;&#124;...</code> | Defines the orientation of the rover list. |
| <strong><code>currentId</code>&nbsp;</strong> | <code>string&nbsp;&#124;&nbsp;null</code> | The current focused element ID. |
| <strong><code>stops</code>&nbsp;</strong> | <code>Stop[]</code> | A list of element refs and IDs of the roving items. |
| <strong><code>register</code>&nbsp;</strong> | <code title="(id: string, ref: RefObject&#60;HTMLElement&#62;) =&#62; void">(id:&nbsp;string,&nbsp;ref:&nbsp;RefObject...</code> | Registers the element ID and ref in the roving tab index list. |
| <strong><code>unregister</code>&nbsp;</strong> | <code>(id:&nbsp;string)&nbsp;=&#62;&nbsp;void</code> | Unregisters the roving item. |
| <strong><code>move</code>&nbsp;</strong> | <code>(id:&nbsp;string&nbsp;&#124;&nbsp;null)&nbsp;=&#62;&nbsp;void</code> | Moves focus to a given element ID. |
| <strong><code>next</code>&nbsp;</strong> | <code>()&nbsp;=&#62;&nbsp;void</code> | Moves focus to the next element. |
| <strong><code>previous</code>&nbsp;</strong> | <code>()&nbsp;=&#62;&nbsp;void</code> | Moves focus to the previous element. |
| <strong><code>first</code>&nbsp;</strong> | <code>()&nbsp;=&#62;&nbsp;void</code> | Moves focus to the first element. |
| <strong><code>last</code>&nbsp;</strong> | <code>()&nbsp;=&#62;&nbsp;void</code> | Moves focus to the last element. |
| <strong><code>stopId</code>&nbsp;</strong> | <code>string&nbsp;&#124;&nbsp;undefined</code> | Element ID. |

### `ToolbarSeparator`

| Name | Type | Description |
|------|------|-------------|
| <strong><code>orientation</code>&nbsp;</strong> | <code title="&#34;horizontal&#34; &#124; &#34;vertical&#34; &#124; undefined">&#34;horizontal&#34;&nbsp;&#124;&nbsp;&#34;vertical&#34;&nbsp;&#124;...</code> | Separator's context orientation. The actual separator's orientation will be flipped based on this prop. So a `"vertical"` orientation means that the separator will have a `"horizontal"` orientation. |
