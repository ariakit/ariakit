---
path: /docs/toolbar/
redirect_from:
  - /components/toolbar/
  - /components/toolbar/toolbarcontent/
  - /components/toolbar/toolbarfocusable/
---

# Toolbar

Accessible `Toolbar` component that follows the [WAI-ARIA Toolbar Pattern](https://www.w3.org/TR/wai-aria-practices/#toolbar). It's a container for grouping a set of controls.

<carbon-ad></carbon-ad>

## Installation

```sh
npm install reakit
```

Learn more in [Get started](/docs/get-started/).

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
  const toolbar = useToolbarState({ loop: true });
  return (
    <Toolbar {...toolbar} aria-label="My toolbar">
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

### `Toolbar` with `Menu`

You can render [Menu](/docs/menu/) within a `Toolbar` using the same techinique to make a [Submenu](/docs/menu/#submenu).

```jsx
import React from "react";
import { useToolbarState, Toolbar, ToolbarItem } from "reakit/Toolbar";
import { useMenuState, MenuDisclosure, Menu, MenuItem } from "reakit/Menu";
import { Button } from "reakit/Button";

const MoreItems = React.forwardRef((props, ref) => {
  const menu = useMenuState({ placement: "bottom-end" });
  return (
    <>
      <MenuDisclosure {...menu} {...props} ref={ref} aria-label="More items" />
      <Menu {...menu} aria-label="More items">
        <MenuItem {...menu}>Item 3</MenuItem>
        <MenuItem {...menu}>Item 4</MenuItem>
        <MenuItem {...menu}>Item 5</MenuItem>
      </Menu>
    </>
  );
});

function Example() {
  const toolbar = useToolbarState();
  return (
    <Toolbar {...toolbar} aria-label="My toolbar">
      <ToolbarItem {...toolbar} as={Button}>
        Item 1
      </ToolbarItem>
      <ToolbarItem {...toolbar} as={Button}>
        Item 2
      </ToolbarItem>
      <ToolbarItem {...toolbar} as={MoreItems} />
    </Toolbar>
  );
}
```

## Accessibility

- `Toolbar` has role `toolbar`.
- `ToolbarItem` extends the accessibility features of [Rover](/docs/rover/).

Learn more in [Accessibility](/docs/accessibility/).

## Composition

- `Toolbar` uses [Box](/docs/box/).
- `ToolbarItem` uses [Rover](/docs/rover/).
- `ToolbarSeparator` uses [Separator](/docs/separator/).

Learn more in [Composition](/docs/composition/#props-hooks).

## Props

<!-- Automatically generated -->

### `useToolbarState`

- **`orientation`**
  <code>&#34;horizontal&#34; | &#34;vertical&#34; | undefined</code>

  Defines the orientation of the rover list.

- **`currentId`**
  <code>string | null</code>

  The current focused element ID.

- **`loop`**
  <code>boolean</code>

  If enabled:
  - Jumps to the first item when moving next from the last item.
  - Jumps to the last item when moving previous from the first item.

### `Toolbar`

<details><summary>1 state props</summary>

> These props are returned by the state hook. You can spread them into this component (`{...state}`) or pass them separately. You can also provide these props from your own state logic.

- **`orientation`**
  <code>&#34;horizontal&#34; | &#34;vertical&#34; | undefined</code>

  Defines the orientation of the rover list.

</details>

### `ToolbarItem`

- **`disabled`**
  <code>boolean | undefined</code>

  Same as the HTML attribute.

- **`focusable`**
  <code>boolean | undefined</code>

  When an element is `disabled`, it may still be `focusable`. It works
similarly to `readOnly` on form elements. In this case, only
`aria-disabled` will be set.

- **`stopId`**
  <code>string | undefined</code>

  Element ID.

<details><summary>11 state props</summary>

> These props are returned by the state hook. You can spread them into this component (`{...state}`) or pass them separately. You can also provide these props from your own state logic.

- **`orientation`**
  <code>&#34;horizontal&#34; | &#34;vertical&#34; | undefined</code>

  Defines the orientation of the rover list.

- **`unstable_moves`** <span title="Experimental">⚠️</span>
  <code>number</code>

  Stores the number of moves that have been made by calling `move`, `next`,
`previous`, `first` or `last`.

- **`currentId`**
  <code>string | null</code>

  The current focused element ID.

- **`stops`**
  <code>Stop[]</code>

  A list of element refs and IDs of the roving items.

- **`register`**
  <code>(id: string, ref: RefObject&#60;HTMLElement&#62;) =&#62; void</code>

  Registers the element ID and ref in the roving tab index list.

- **`unregister`**
  <code>(id: string) =&#62; void</code>

  Unregisters the roving item.

- **`move`**
  <code>(id: string | null) =&#62; void</code>

  Moves focus to a given element ID.

- **`next`**
  <code>() =&#62; void</code>

  Moves focus to the next element.

- **`previous`**
  <code>() =&#62; void</code>

  Moves focus to the previous element.

- **`first`**
  <code>() =&#62; void</code>

  Moves focus to the first element.

- **`last`**
  <code>() =&#62; void</code>

  Moves focus to the last element.

</details>

### `ToolbarSeparator`

<details><summary>1 state props</summary>

> These props are returned by the state hook. You can spread them into this component (`{...state}`) or pass them separately. You can also provide these props from your own state logic.

- **`orientation`**
  <code>&#34;horizontal&#34; | &#34;vertical&#34; | undefined</code>

  Separator's orientation.

</details>
