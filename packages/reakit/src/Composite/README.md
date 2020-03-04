---
path: /docs/composite/
experimental: true
---

# Composite

<blockquote experimental="true">
  <strong>This is experimental</strong> and may have breaking changes in minor or patch version updates. Issues for this module will have lower priority. Even so, if you use it, feel free to <a href="https://github.com/reakit/reakit/issues/new/choose" target="_blank">give us feedback</a>.
</blockquote>

`Composite` is a component that may contain navigable items represented by `CompositeItem`. It's inspired by the [WAI-ARIA Composite Role](https://www.w3.org/TR/wai-aria-1.1/#composite) and implements all the [keyboard navigation mechanisms](https://www.w3.org/TR/wai-aria-practices/#kbd_general_within) to ensure that there's only one tab stop for the whole `Composite` element. This means that it can behave as a [roving tabindex](https://www.w3.org/TR/wai-aria-practices/#kbd_roving_tabindex) or [aria-activedescendant](https://www.w3.org/TR/wai-aria-practices/#kbd_focus_activedescendant) container.

Since this a very abstract component, it's recommended that you use more concrete ones like `Menu`, `Toolbar`, `Grid` and other derivative components, or build your own on top of `Composite`.

<carbon-ad></carbon-ad>

## Installation

```sh
npm install reakit
```

Learn more in [Get started](/docs/get-started/).

## Usage

In the most basic usage, `Composite` will work as a [roving tabindex](https://www.w3.org/TR/wai-aria-practices/#kbd_roving_tabindex) container that works on both directions. That is, it listens to all arrow keys. You can specify a direction by passing an `orientation` initial state to `useCompositeState`.

```jsx
import React from "react";
import {
  unstable_useCompositeState as useCompositeState,
  unstable_Composite as Composite,
  unstable_CompositeItem as CompositeItem
} from "reakit/Composite";

function Example() {
  const composite = useCompositeState();
  return (
    <Composite {...composite} role="toolbar" aria-label="My toolbar">
      <CompositeItem {...composite} onClick={alert}>
        Item 1
      </CompositeItem>
      <CompositeItem {...composite}>Item 2</CompositeItem>
      <CompositeItem {...composite}>Item 3</CompositeItem>
    </Composite>
  );
}
```

### aria-activedescendant

`Composite` may work as an [aria-activedescendant](https://www.w3.org/TR/wai-aria-practices/#kbd_focus_activedescendant) container by just setting the `unstable_focusStrategy` initial state to `useCompositeState`.

You can still attach event handlers to `CompositeItem` just like it were using the roving tabindex method. You don't need to change anything else to make it work.

```jsx
import React from "react";
import {
  unstable_useCompositeState as useCompositeState,
  unstable_Composite as Composite,
  unstable_CompositeItem as CompositeItem
} from "reakit/Composite";

function Example() {
  const composite = useCompositeState({
    unstable_focusStrategy: "aria-activedescendant"
  });
  return (
    <Composite {...composite} role="toolbar" aria-label="My toolbar">
      <CompositeItem {...composite} onClick={alert}>
        Item 1
      </CompositeItem>
      <CompositeItem {...composite}>Item 2</CompositeItem>
      <CompositeItem {...composite}>Item 3</CompositeItem>
    </Composite>
  );
}
```

### Two-dimensional navigation

You can build a two-dimensional `Composite` by using `CompositeRow`.

```jsx
import React from "react";
import {
  unstable_useCompositeState as useCompositeState,
  unstable_Composite as Composite,
  unstable_CompositeRow as CompositeRow,
  unstable_CompositeItem as CompositeItem
} from "reakit/Composite";

function Example() {
  const composite = useCompositeState();
  return (
    <Composite {...composite} role="grid" aria-label="My grid">
      <CompositeRow {...composite} style={{ width: 400 }}>
        <CompositeItem {...composite} onClick={alert}>
          Item 1.1
        </CompositeItem>
        <CompositeItem {...composite}>Item 1.2</CompositeItem>
        <CompositeItem {...composite} disabled focusable>
          Item 1.3
        </CompositeItem>
        <CompositeItem {...composite}>Item 1.4</CompositeItem>
        <CompositeItem {...composite}>Item 1.5</CompositeItem>
      </CompositeRow>
      <CompositeRow {...composite}>
        <CompositeItem {...composite}>Item 2.1</CompositeItem>
        <CompositeItem {...composite} disabled>
          Item 2.2
        </CompositeItem>
        <CompositeItem {...composite}>Item 2.3</CompositeItem>
        <CompositeItem {...composite} disabled>
          Item 2.4
        </CompositeItem>
        <CompositeItem {...composite}>Item 2.5</CompositeItem>
      </CompositeRow>
      <CompositeRow {...composite}>
        <CompositeItem {...composite}>Item 3.1</CompositeItem>
        <CompositeItem {...composite} disabled focusable>
          Item 3.2
        </CompositeItem>
        <CompositeItem {...composite}>Item 3.3</CompositeItem>

        <CompositeItem {...composite}>Item 3.4</CompositeItem>
        <CompositeItem {...composite}>Item 3.5</CompositeItem>
      </CompositeRow>
    </Composite>
  );
}

```

## Accessibility

- `Rover` has `tabindex` set to `0` if it's the current element. Otherwise `tabindex` is set to `-1`.
- Pressing <kbd>↑</kbd> moves focus to the previous `Rover` if `orientation` is `vertical` or not defined.
- Pressing <kbd>↓</kbd> moves focus to the next `Rover` if `orientation` is `vertical` or not defined.
- Pressing <kbd>→</kbd> moves focus to the next `Rover` if `orientation` is `horizontal` or not defined.
- Pressing <kbd>←</kbd> moves focus to the previous `Rover` if `orientation` is `horizontal` or not defined.
- Pressing <kbd>Home</kbd> or <kbd>PageUp</kbd> moves focus to the first `Rover`.
- Pressing <kbd>End</kbd> or <kbd>PageDown</kbd> moves focus to the last `Rover`.

Learn more in [Accessibility](/docs/accessibility/).

## Composition

- `Rover` uses [Tabbable](/docs/tabbable/), and is used by [MenuItem](/docs/menu/), [Radio](/docs/radio/), [Tab](/docs/tab/) and [ToolbarItem](/docs/toolbar/).

Learn more in [Composition](/docs/composition/#props-hooks).

## Props

<!-- Automatically generated -->

### `useCompositeState`

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

  When the composite widget has multiple rows (two-dimensional) and `wrap`
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
rows (two-dimensional).

- **`wrap`**
  <code>boolean</code>

  If enabled, moving to the next item from the last one in a row or column
will focus the first item in the next row or column and vice-versa.
Depending on the value of the `orientation` state, it'll wrap in only one
direction:
  - If `orientation` is `undefined`, it wraps in both directions.
  - If `orientation` is `horizontal`, it wraps horizontally only.
  - If `orientation` is `vertical`, it wraps vertically only.

  `wrap` only works if the composite widget has multiple rows
(two-dimensional).

### `Composite`

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

<details><summary>3 state props</summary>

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

</details>

### `CompositeItem`

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

<details><summary>13 state props</summary>

> These props are returned by the state hook. You can spread them into this component (`{...state}`) or pass them separately. You can also provide these props from your own state logic.

- **`baseId`**
  <code>string</code>

  ID that will serve as a base for all the items IDs.

- **`orientation`**
  <code>&#34;horizontal&#34; | &#34;vertical&#34; | undefined</code>

  Defines the orientation of the composite widget.

  When the composite widget has multiple rows (two-dimensional) and `wrap`
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
  <code>(value: string | null) =&#62; void</code>

  Sets `currentId`.

</details>

### `CompositeItemWidget`

<details><summary>1 state props</summary>

> These props are returned by the state hook. You can spread them into this component (`{...state}`) or pass them separately. You can also provide these props from your own state logic.

- **`currentId`**
  <code>string | null</code>

  The current focused item ID.

</details>

### `CompositeRow`

- **`id`**
  <code>string | undefined</code>

  Same as the HTML attribute.

<details><summary>3 state props</summary>

> These props are returned by the state hook. You can spread them into this component (`{...state}`) or pass them separately. You can also provide these props from your own state logic.

- **`baseId`**
  <code>string</code>

  ID that will serve as a base for all the items IDs.

- **`registerRow`**
  <code>(row: Row) =&#62; void</code>

  Registers a composite row.

- **`unregisterRow`**
  <code>(id: string) =&#62; void</code>

  Unregisters a composite row.

</details>
