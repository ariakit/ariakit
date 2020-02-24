---
path: /docs/composite/
experimental: true
---

# Composite

`Rover` is an abstract component that implements the [roving tabindex](https://www.w3.org/TR/wai-aria-practices-1.1/#kbd_roving_tabindex) method to manage focus between items (rovers).

<carbon-ad></carbon-ad>

## Installation

```sh
npm install reakit
```

Learn more in [Get started](/docs/get-started/).

## Usage

```jsx
import {
  unstable_useCompositeState as useCompositeState,
  unstable_Composite as Composite,
  unstable_CompositeRow as CompositeRow,
  unstable_CompositeItem as CompositeItem
} from "reakit/Composite";
import { Group } from "reakit/Group";
import { Button } from "reakit/Button";

function Example() {
  const composite = useCompositeState({
    unstable_focusStrategy: "aria-activedescendant"
  });
  return (
    <Composite {...composite}>
      <CompositeRow {...composite}>
        <CompositeItem {...composite} onClick={console.log}>
          Button 1
        </CompositeItem>
        <CompositeItem {...composite}>Button 2</CompositeItem>
        <CompositeItem {...composite} disabled focusable>
          Button 3
        </CompositeItem>
        <CompositeItem {...composite}>Button 4</CompositeItem>
        <CompositeItem {...composite}>Button 5</CompositeItem>
      </CompositeRow>
      <CompositeRow {...composite}>
        <CompositeItem {...composite}>Button 1</CompositeItem>
        <CompositeItem {...composite} disabled>
          Button 2
        </CompositeItem>
        <CompositeItem {...composite}>Button 3</CompositeItem>
        <CompositeItem {...composite} disabled>
          Button 4
        </CompositeItem>
        <CompositeItem {...composite}>Button 5</CompositeItem>
      </CompositeRow>
      <CompositeRow {...composite}>
        <CompositeItem {...composite}>Button 1</CompositeItem>
        <CompositeItem {...composite} disabled focusable>
          Button 2
        </CompositeItem>
        <CompositeItem {...composite}>Button 3</CompositeItem>
        <CompositeItem {...composite}>Button 4</CompositeItem>
        <CompositeItem {...composite}>Button 5</CompositeItem>
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

- **`unstable_focusStrategy`** <span title="Experimental">⚠️</span>
  <code>&#34;roving-tabindex&#34; | &#34;aria-activedescendant&#34;</code>

  TODO

- **`orientation`**
  <code>&#34;horizontal&#34; | &#34;vertical&#34; | undefined</code>

  Defines the orientation of the composite.

- **`currentId`**
  <code>string | null</code>

  The current focused stop ID.

- **`loop`**
  <code>boolean</code>

  If enabled, moving to the next stop from the last one will focus the first
stop and vice-versa. It doesn't work if this is a two-dimensional
composite (with rows and cells).

- **`wrap`**
  <code>boolean</code>

  If enabled, moving to the next stop from the last one in a row or column
will focus the first stop in the next row or column and vice-versa. If
this is going to wrap rows, columns or both, it depends on the value of
`orientation`:

  - If `undefined`, it wraps both.
  - If `horizontal`, it wraps rows only.
  - If `vertical`, it wraps columns only.

`wrap` only works if this is a two-dimensional composite (with rows and
cells).

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

<details><summary>17 state props</summary>

> These props are returned by the state hook. You can spread them into this component (`{...state}`) or pass them separately. You can also provide these props from your own state logic.

- **`baseId`**
  <code>string</code>

  ID that will serve as a base for all the items IDs.

- **`orientation`**
  <code>&#34;horizontal&#34; | &#34;vertical&#34; | undefined</code>

  Defines the orientation of the composite.

- **`unstable_moves`** <span title="Experimental">⚠️</span>
  <code>number</code>

  Stores the number of moves that have been made by calling `move`, `next`,
`previous`, `up`, `down`, `first` or `last`.

- **`unstable_focusStrategy`** <span title="Experimental">⚠️</span>
  <code>&#34;roving-tabindex&#34; | &#34;aria-activedescendant&#34;</code>

  TODO

- **`currentId`**
  <code>string | null</code>

  The current focused stop ID.

- **`compositeRef`**
  <code>MutableRefObject&#60;HTMLElement | undefined&#62;</code>

  TODO.

- **`stops`**
  <code>Stop[]</code>

  A list of stops.
TODO: Rename to items
Use only "id" attribute on items

- **`registerStop`**
  <code>(stop: Stop) =&#62; void</code>

  TODO

- **`unregisterStop`**
  <code>(id: string) =&#62; void</code>

  TODO

- **`setCurrentId`**
  <code>(value: string | null) =&#62; void</code>

  TODO

- **`next`**
  <code title="(unstable_allTheWayInRow?: boolean | undefined) =&#62; void">(unstable_allTheWayInRow?: boolean | undefined)...</code>

  Moves focus to the next element.

- **`previous`**
  <code title="(unstable_allTheWayInRow?: boolean | undefined) =&#62; void">(unstable_allTheWayInRow?: boolean | undefined)...</code>

  Moves focus to the previous element.

- **`rows`**
  <code>Row[]</code>

  A list rows.

- **`up`**
  <code title="(unstable_allTheWayInRow?: boolean | undefined) =&#62; void">(unstable_allTheWayInRow?: boolean | undefined)...</code>

  Moves focus to the element above.

- **`down`**
  <code title="(unstable_allTheWayInRow?: boolean | undefined) =&#62; void">(unstable_allTheWayInRow?: boolean | undefined)...</code>

  Moves focus to the element below.

- **`first`**
  <code>() =&#62; void</code>

  Moves focus to the first element.

- **`last`**
  <code>() =&#62; void</code>

  Moves focus to the last element.

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

- **`stopId`**
  <code>string | undefined</code>

  Element ID.

<details><summary>16 state props</summary>

> These props are returned by the state hook. You can spread them into this component (`{...state}`) or pass them separately. You can also provide these props from your own state logic.

- **`baseId`**
  <code>string</code>

  ID that will serve as a base for all the items IDs.

- **`orientation`**
  <code>&#34;horizontal&#34; | &#34;vertical&#34; | undefined</code>

  Defines the orientation of the composite.

- **`unstable_moves`** <span title="Experimental">⚠️</span>
  <code>number</code>

  Stores the number of moves that have been made by calling `move`, `next`,
`previous`, `up`, `down`, `first` or `last`.

- **`unstable_focusStrategy`** <span title="Experimental">⚠️</span>
  <code>&#34;roving-tabindex&#34; | &#34;aria-activedescendant&#34;</code>

  TODO

- **`currentId`**
  <code>string | null</code>

  The current focused stop ID.

- **`compositeRef`**
  <code>MutableRefObject&#60;HTMLElement | undefined&#62;</code>

  TODO.

- **`stops`**
  <code>Stop[]</code>

  A list of stops.
TODO: Rename to items
Use only "id" attribute on items

- **`registerStop`**
  <code>(stop: Stop) =&#62; void</code>

  TODO

- **`unregisterStop`**
  <code>(id: string) =&#62; void</code>

  TODO

- **`next`**
  <code title="(unstable_allTheWayInRow?: boolean | undefined) =&#62; void">(unstable_allTheWayInRow?: boolean | undefined)...</code>

  Moves focus to the next element.

- **`previous`**
  <code title="(unstable_allTheWayInRow?: boolean | undefined) =&#62; void">(unstable_allTheWayInRow?: boolean | undefined)...</code>

  Moves focus to the previous element.

- **`up`**
  <code title="(unstable_allTheWayInRow?: boolean | undefined) =&#62; void">(unstable_allTheWayInRow?: boolean | undefined)...</code>

  Moves focus to the element above.

- **`down`**
  <code title="(unstable_allTheWayInRow?: boolean | undefined) =&#62; void">(unstable_allTheWayInRow?: boolean | undefined)...</code>

  Moves focus to the element below.

- **`first`**
  <code>() =&#62; void</code>

  Moves focus to the first element.

- **`last`**
  <code>() =&#62; void</code>

  Moves focus to the last element.

- **`move`**
  <code>(id: string | null) =&#62; void</code>

  Moves focus to a given element ID.

</details>

### `CompositeRow`

- **`id`**
  <code>string | undefined</code>

  Same as the HTML attribute.

- **`stopId`**
  <code>string | undefined</code>

  Element ID.

<details><summary>5 state props</summary>

> These props are returned by the state hook. You can spread them into this component (`{...state}`) or pass them separately. You can also provide these props from your own state logic.

- **`baseId`**
  <code>string</code>

  ID that will serve as a base for all the items IDs.

- **`orientation`**
  <code>&#34;horizontal&#34; | &#34;vertical&#34; | undefined</code>

  Defines the orientation of the composite.

- **`unstable_moves`** <span title="Experimental">⚠️</span>
  <code>number</code>

  Stores the number of moves that have been made by calling `move`, `next`,
`previous`, `up`, `down`, `first` or `last`.

- **`registerRow`**
  <code>(row: Row) =&#62; void</code>

  TODO

- **`unregisterRow`**
  <code>(id: string) =&#62; void</code>

  TODO

</details>
