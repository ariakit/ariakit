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
import { useMenuState, MenuButton, Menu, MenuItem } from "reakit/Menu";
import { Button } from "reakit/Button";

const MoreItems = React.forwardRef((props, ref) => {
  const menu = useMenuState({ placement: "bottom-end" });
  return (
    <>
      <MenuButton {...menu} {...props} ref={ref} aria-label="More items" />
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
- `Toolbar` extends the accessibility features of [Composite](/docs/composite/#accessibility).
- `ToolbarItem` extends the accessibility features of [CompositeItem](/docs/composite/#accessibility).

Learn more in [Accessibility](/docs/accessibility/).

## Composition

- `Toolbar` uses [Composite](/docs/composite/).
- `ToolbarItem` uses [CompositeItem](/docs/composite/).
- `ToolbarSeparator` uses [Separator](/docs/separator/).

Learn more in [Composition](/docs/composition/#props-hooks).

## Props

<!-- Automatically generated -->

### `useToolbarState`

- **`baseId`**
  <code>string</code>

  ID that will serve as a base for all the items IDs.

- **`rtl`**
  <code>boolean</code>

  Determines how `next` and `previous` will behave. If `rtl` is set to `true`,
then `next` will move focus to the previous item in the DOM.

- **`orientation`**
  <code>&#34;horizontal&#34; | &#34;vertical&#34; | undefined</code>

  Defines the orientation of the composite widget.

  When the composite widget has multiple groups (two-dimensional) and `wrap`
is `true`, the navigation will wrap based on the value of `orientation`:
  - `undefined`: wraps in both directions.
  - `horizontal`: wraps horizontally only.
  - `vertical`: wraps vertically only.

  If the composite widget has a single row or column (one-dimensional), the
`orientation` value determines which arrow keys can be used to move focus:
  - `undefined`: all arrow keys work.
  - `horizontal`: only left and right arrow keys work.
  - `vertical`: only up and down arrow keys work.

- **`currentId`**
  <code>string | null</code>

  The current focused item ID.

- **`loop`**
  <code>boolean</code>

  If enabled, moving to the next item from the last one will focus the first
item and vice-versa. It doesn't work if the composite widget has multiple
groups (two-dimensional).

- **`wrap`**
  <code>boolean</code>

  If enabled, moving to the next item from the last one in a row or column
will focus the first item in the next row or column and vice-versa.
Depending on the value of the `orientation` state, it'll wrap in only one
direction:
  - If `orientation` is `undefined`, it wraps in both directions.
  - If `orientation` is `horizontal`, it wraps horizontally only.
  - If `orientation` is `vertical`, it wraps vertically only.

  `wrap` only works if the composite widget has multiple groups
(two-dimensional).

### `Toolbar`

- **`disabled`**
  <code>boolean | undefined</code>

  Same as the HTML attribute.

- **`focusable`**
  <code>boolean | undefined</code>

  When an element is `disabled`, it may still be `focusable`. It works
similarly to `readOnly` on form elements. In this case, only
`aria-disabled` will be set.

- **`id`**
  <code>string | undefined</code>

  Same as the HTML attribute.

<details><summary>4 state props</summary>

> These props are returned by the state hook. You can spread them into this component (`{...state}`) or pass them separately. You can also provide these props from your own state logic.

- **`baseId`**
  <code>string</code>

  ID that will serve as a base for all the items IDs.

- **`currentId`**
  <code>string | null</code>

  The current focused item ID.

- **`items`**
  <code>Item[]</code>

  Lists all the composite items.

- **`orientation`**
  <code>&#34;horizontal&#34; | &#34;vertical&#34; | undefined</code>

  Defines the orientation of the composite widget.

  When the composite widget has multiple groups (two-dimensional) and `wrap`
is `true`, the navigation will wrap based on the value of `orientation`:
  - `undefined`: wraps in both directions.
  - `horizontal`: wraps horizontally only.
  - `vertical`: wraps vertically only.

  If the composite widget has a single row or column (one-dimensional), the
`orientation` value determines which arrow keys can be used to move focus:
  - `undefined`: all arrow keys work.
  - `horizontal`: only left and right arrow keys work.
  - `vertical`: only up and down arrow keys work.

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

- **`id`**
  <code>string | undefined</code>

  Same as the HTML attribute.

<details><summary>14 state props</summary>

> These props are returned by the state hook. You can spread them into this component (`{...state}`) or pass them separately. You can also provide these props from your own state logic.

- **`baseId`**
  <code>string</code>

  ID that will serve as a base for all the items IDs.

- **`orientation`**
  <code>&#34;horizontal&#34; | &#34;vertical&#34; | undefined</code>

  Defines the orientation of the composite widget.

  When the composite widget has multiple groups (two-dimensional) and `wrap`
is `true`, the navigation will wrap based on the value of `orientation`:
  - `undefined`: wraps in both directions.
  - `horizontal`: wraps horizontally only.
  - `vertical`: wraps vertically only.

  If the composite widget has a single row or column (one-dimensional), the
`orientation` value determines which arrow keys can be used to move focus:
  - `undefined`: all arrow keys work.
  - `horizontal`: only left and right arrow keys work.
  - `vertical`: only up and down arrow keys work.

- **`currentId`**
  <code>string | null</code>

  The current focused item ID.

- **`items`**
  <code>Item[]</code>

  Lists all the composite items.

- **`registerItem`**
  <code>(item: Item) =&#62; void</code>

  Registers a composite item.

- **`unregisterItem`**
  <code>(id: string) =&#62; void</code>

  Unregisters a composite item.

- **`move`**
  <code>(id: string | null) =&#62; void</code>

  Moves focus to a given item ID.

- **`next`**
  <code>(unstable_allTheWay?: boolean | undefined) =&#62; void</code>

  Moves focus to the next item.

- **`previous`**
  <code>(unstable_allTheWay?: boolean | undefined) =&#62; void</code>

  Moves focus to the previous item.

- **`up`**
  <code>(unstable_allTheWay?: boolean | undefined) =&#62; void</code>

  Moves focus to the item above.

- **`down`**
  <code>(unstable_allTheWay?: boolean | undefined) =&#62; void</code>

  Moves focus to the item below.

- **`first`**
  <code>() =&#62; void</code>

  Moves focus to the first item.

- **`last`**
  <code>() =&#62; void</code>

  Moves focus to the last item.

- **`setCurrentId`**
  <code>(value: SetStateAction&#60;string | null&#62;) =&#62; void</code>

  Sets `currentId`.

</details>

### `ToolbarSeparator`

<details><summary>1 state props</summary>

> These props are returned by the state hook. You can spread them into this component (`{...state}`) or pass them separately. You can also provide these props from your own state logic.

- **`orientation`**
  <code>&#34;horizontal&#34; | &#34;vertical&#34; | undefined</code>

  Separator's orientation.

</details>
