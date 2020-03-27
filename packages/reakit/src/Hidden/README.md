---
path: /docs/hidden/
---

# Hidden

Accessible `Hidden` component that is an abstraction based on the [WAI-ARIA Disclosure Pattern](https://www.w3.org/TR/wai-aria-practices/#disclosure).

<carbon-ad></carbon-ad>

## Installation

```sh
npm install reakit
```

Learn more in [Get started](/docs/get-started/).

## Usage

```jsx
import { useHiddenState, Hidden, HiddenDisclosure } from "reakit/Hidden";

function Example() {
  const hidden = useHiddenState({ visible: true });
  return (
    <>
      <HiddenDisclosure {...hidden}>Toggle</HiddenDisclosure>
      <Hidden {...hidden}>Hidden</Hidden>
    </>
  );
}
```

### Conditionally rendering

You shouldn't conditionally render the `Hidden` component as this will make some Reakit features not work. Instead, you can use [render props](/docs/composition/#render-props) and conditionally render the underneath element:

```jsx
import { useHiddenState, Hidden, HiddenDisclosure } from "reakit/Hidden";

function Example() {
  const hidden = useHiddenState();
  return (
    <>
      <HiddenDisclosure {...hidden}>Toggle</HiddenDisclosure>
      {/* instead of {hidden.visible && <Hidden {...hidden}>Hidden</Hidden>} */}
      <Hidden {...hidden}>
        {props => hidden.visible && <div {...props}>Hidden</div>}
      </Hidden>
    </>
  );
}
```

### Multiple components

Each `Hidden` component should have its own `useHiddenState`. This is also true for derivative modules like [Dialog](/docs/dialog/), [Popover](/docs/popover/), [Menu](/docs/menu/), [Tooltip](/docs/tooltip/) etc.

If you want to have only one `HiddenDisclosure` element controling multiple `Hidden` components, you can use [render props](/docs/composition/#render-props) to apply the same state to different `HiddenDisclosure`s that will result in a single element.

```jsx
import { useHiddenState, Hidden, HiddenDisclosure } from "reakit/Hidden";

function Example() {
  const hidden1 = useHiddenState();
  const hidden2 = useHiddenState();
  return (
    <>
      <HiddenDisclosure {...hidden1}>
        {props => (
          <HiddenDisclosure {...props} {...hidden2}>
            Toggle All
          </HiddenDisclosure>
        )}
      </HiddenDisclosure>
      <Hidden {...hidden1}>Hidden 1</Hidden>
      <Hidden {...hidden2}>Hidden 2</Hidden>
    </>
  );
}
```

## Accessibility

- `HiddenDisclosure` extends the accessibility features of [Button](/docs/button/#accessibility).
- `HiddenDisclosure` has a value specified for `aria-controls` that refers to `Hidden`.
- When `Hidden` is visible, `HiddenDisclosure` has `aria-expanded` set to `true`. When `Hidden` is hidden, it is set to `false`.

Learn more in [Accessibility](/docs/accessibility/).

## Composition

- `Hidden` uses [Box](/docs/box/), and is used by [Dialog](/docs/dialog/), [DialogBackdrop](/docs/dialog/), [TabPanel](/docs/tab/), [Tooltip](/docs/tooltip/) and all their derivatives.
- `HiddenDisclosure` uses [Button](/docs/button/), and is used by [DialogDisclosure](/docs/dialog/).

Learn more in [Composition](/docs/composition/#props-hooks).

## Props

<!-- Automatically generated -->

### `useHiddenState`

- **`baseId`**
  <code>string</code>

  ID that will serve as a base for all the items IDs.

- **`visible`**
  <code>boolean</code>

  Whether it's visible or not.

- **`unstable_animated`** <span title="Experimental">⚠️</span>
  <code>number | boolean</code>

  If `true`, `animating` will be set to `true` when `visible` changes.
It'll wait for `stopAnimation` to be called or a CSS transition ends.
If it's a number, `stopAnimation` will be called automatically after
given milliseconds.

### `Hidden`

- **`id`**
  <code>string | undefined</code>

  Same as the HTML attribute.

<details><summary>4 state props</summary>

> These props are returned by the state hook. You can spread them into this component (`{...state}`) or pass them separately. You can also provide these props from your own state logic.

- **`baseId`**
  <code>string</code>

  ID that will serve as a base for all the items IDs.

- **`visible`**
  <code>boolean</code>

  Whether it's visible or not.

- **`unstable_animated`** <span title="Experimental">⚠️</span>
  <code>number | boolean</code>

  If `true`, `animating` will be set to `true` when `visible` changes.
It'll wait for `stopAnimation` to be called or a CSS transition ends.
If it's a number, `stopAnimation` will be called automatically after
given milliseconds.

- **`unstable_stopAnimation`** <span title="Experimental">⚠️</span>
  <code>() =&#62; void</code>

  Stops animation. It's called automatically if there's a CSS transition.
It's called after given milliseconds if `animated` is a number.

</details>

### `HiddenDisclosure`

- **`disabled`**
  <code>boolean | undefined</code>

  Same as the HTML attribute.

- **`focusable`**
  <code>boolean | undefined</code>

  When an element is `disabled`, it may still be `focusable`. It works
similarly to `readOnly` on form elements. In this case, only
`aria-disabled` will be set.

<details><summary>3 state props</summary>

> These props are returned by the state hook. You can spread them into this component (`{...state}`) or pass them separately. You can also provide these props from your own state logic.

- **`visible`**
  <code>boolean</code>

  Whether it's visible or not.

- **`baseId`**
  <code>string</code>

  ID that will serve as a base for all the items IDs.

- **`toggle`**
  <code>() =&#62; void</code>

  Toggles the `visible` state

</details>
