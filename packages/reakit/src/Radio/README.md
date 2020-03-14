---
path: /docs/radio/
---

# Radio

Accessible `Radio` component that follows the [WAI-ARIA Radio Button/Group Pattern](https://www.w3.org/TR/wai-aria-practices/#radiobutton).

<carbon-ad></carbon-ad>

## Installation

```sh
npm install reakit
```

Learn more in [Get started](/docs/get-started/).

## Usage

```jsx
import { useRadioState, Radio, RadioGroup } from "reakit/Radio";

function Example() {
  const radio = useRadioState({
    unstable_focusStrategy: "aria-activedescendant"
  });
  return (
    <RadioGroup {...radio} aria-label="fruits">
      <label>
        <Radio {...radio} value="apple" /> apple
      </label>
      <label>
        <Radio {...radio} value="orange" /> orange
      </label>
      <label>
        <Radio {...radio} value="watermelon" /> watermelon
      </label>
    </RadioGroup>
  );
}
```

### Default value

To set a default value, you can pass the `value` of the current checked radio to the `state` property on `useRadioState`.

```jsx
import { useRadioState, Radio, RadioGroup } from "reakit/Radio";

function Example() {
  const radio = useRadioState({ state: "orange" });
  return (
    <RadioGroup {...radio} aria-label="fruits">
      <label>
        <Radio {...radio} value="apple" /> apple
      </label>
      <label>
        <Radio {...radio} value="orange" /> orange
      </label>
      <label>
        <Radio {...radio} value="watermelon" /> watermelon
      </label>
    </RadioGroup>
  );
}
```

## Accessibility

- `Radio` has role `radio`.
- `Radio` has `aria-checked` set to `true` when it's checked. Otherwise, `aria-checked` is set to `false`.
- `Radio` extends the accessibility features of [Rover](/docs/rover/), which means it uses the [roving tabindex](https://www.w3.org/TR/wai-aria-practices-1.1/#kbd_roving_tabindex) method to manage focus.

Learn more in [Accessibility](/docs/accessibility/).

## Composition

- `Radio` uses [Rover](/docs/rover/), and is used by [FormRadio](/docs/form/) and [MenuItemRadio](/docs/radio/).
- `RadioGroup` uses [Box](/docs/box/).

Learn more in [Composition](/docs/composition/#props-hooks).

## Props

<!-- Automatically generated -->

### `useRadioState`

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

- **`focusWrap`**
  <code>boolean</code>

  If enabled, moving to the next item from the last one in a row or column
will focus the first item in the next row or column and vice-versa.
Depending on the value of the `orientation` state, it'll wrap in only one
direction:
  - If `orientation` is `undefined`, it wraps in both directions.
  - If `orientation` is `horizontal`, it wraps horizontally only.
  - If `orientation` is `vertical`, it wraps vertically only.

  `focusWrap` only works if the composite widget has multiple groups
(two-dimensional).

- **`state`**
  <code>any</code>

  The `value` attribute of the current checked radio.

### `Radio`

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

- **`value`**
  <code>any</code>

  Same as the `value` attribute.

- **`checked`**
  <code>boolean | undefined</code>

  Same as the `checked` attribute.

<details><summary>16 state props</summary>

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

- **`setCurrentId`**
  <code>(value: SetStateAction&#60;string | null&#62;) =&#62; void</code>

  Sets `currentId`.

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

- **`state`**
  <code>any</code>

  The `value` attribute of the current checked radio.

- **`setState`**
  <code>(value: any) =&#62; void</code>

  Sets `state`.

</details>

### `RadioGroup`

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
