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
  const radio = useRadioState();
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

- **`stopId`**
  <code>string | undefined</code>

  Element ID.

- **`value`**
  <code>any</code>

  Same as the `value` attribute.

- **`checked`**
  <code>boolean | undefined</code>

  Same as the `checked` attribute.

<details><summary>13 state props</summary>

> These props are returned by the state hook. You can spread them into this component (`{...state}`) or pass them separately. You can also provide these props from your own state logic.

- **`orientation`**
  <code>&#34;horizontal&#34; | &#34;vertical&#34; | undefined</code>

  Defines the orientation of the rover list.

- **`currentId`**
  <code>string | null</code>

  The current focused element ID.

- **`unstable_moves`** <span title="Experimental">⚠️</span>
  <code>number</code>

  Stores the number of moves that have been made by calling `move`, `next`,
`previous`, `first` or `last`.

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

- **`state`**
  <code>any</code>

  The `value` attribute of the current checked radio.

- **`setState`**
  <code>(value: any) =&#62; void</code>

  Sets `state`.

</details>

### `RadioGroup`

No props to show
