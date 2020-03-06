---
path: /docs/disclosure/
redirect_from:
  - /components/hidden/
  - /components/hidden/hiddencontainer/
  - /components/hidden/hiddenhide/
  - /components/hidden/hiddenshow/
  - /components/hidden/hiddentoggle/
---

# Disclosure

Accessible `Disclosure` compoennt that controls visibility of a section of content. It follows the [WAI-ARIA Disclosure Pattern](https://www.w3.org/TR/wai-aria-practices/#disclosure).

<carbon-ad></carbon-ad>

## Installation

```sh
npm install reakit
```

Learn more in [Get started](/docs/get-started/).

## Usage

```jsx
import {
  useDisclosureState,
  Disclosure,
  DisclosureContent
} from "reakit/Disclosure";

function Example() {
  const disclosure = useDisclosureState({ visible: true });
  return (
    <>
      <Disclosure {...disclosure}>Toggle</Disclosure>
      <DisclosureContent {...disclosure}>Content</DisclosureContent>
    </>
  );
}
```

### Conditionally rendering

You shouldn't conditionally render the `DisclosureContent` component as this will make some Reakit features not work. Instead, you can use [render props](/docs/composition/#render-props) and conditionally render the underneath element:

```jsx
import {
  useDisclosureState,
  Disclosure,
  DisclosureContent
} from "reakit/Disclosure";

function Example() {
  const disclosure = useDisclosureState();
  return (
    <>
      <Disclosure {...disclosure}>Toggle</Disclosure>
      {/* instead of {disclosure.visible && <DisclosureContent {...disclosure}>Content</DisclosureContent>} */}
      <DisclosureContent {...disclosure}>
        {props => disclosure.visible && <div {...props}>Content</div>}
      </DisclosureContent>
    </>
  );
}
```

### Multiple components

Each `DisclosureContent` component should have its own `useDisclosureState`. This is also true for derivative modules like [Dialog](/docs/dialog/), [Popover](/docs/popover/), [Menu](/docs/menu/), [Tooltip](/docs/tooltip/) etc.

If you want to have only one `Disclosure` element controling multiple `DisclosureContent` components, you can use [render props](/docs/composition/#render-props) to apply the same state to different `Disclosure`s that will result in a single element.

```jsx
import {
  useDisclosureState,
  Disclosure,
  DisclosureContent
} from "reakit/Disclosure";

function Example() {
  const disclosure1 = useDisclosureState();
  const disclosure2 = useDisclosureState();
  return (
    <>
      <Disclosure {...disclosure1}>
        {props => (
          <Disclosure {...props} {...disclosure2}>
            Toggle All
          </Disclosure>
        )}
      </Disclosure>
      <DisclosureContent {...disclosure1}>Content 1</DisclosureContent>
      <DisclosureContent {...disclosure2}>Content 2</DisclosureContent>
    </>
  );
}
```

## Accessibility

- `Disclosure` extends the accessibility features of [Button](/docs/button/#accessibility).
- `Disclosure` has a value specified for `aria-controls` that refers to `DisclosureContent`.
- When `DisclosureContent` is visible, `Disclosure` has `aria-expanded` set to `true`. When `DisclosureContent` is hidden, it is set to `false`.

Learn more in [Accessibility](/docs/accessibility/).

## Composition

- `Disclosure` uses [Button](/docs/button/), and is used by [DialogDisclosure](/docs/dialog/).
- `DisclosureContent` uses [Box](/docs/box/), and is used by [Dialog](/docs/dialog/), [DialogBackdrop](/docs/dialog/), [TabPanel](/docs/tab/), [Tooltip](/docs/tooltip/) and all their derivatives.

Learn more in [Composition](/docs/composition/#props-hooks).

## Props

<!-- Automatically generated -->

### `useDisclosureState`

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

### `Disclosure`

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

### `DisclosureContent`

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
