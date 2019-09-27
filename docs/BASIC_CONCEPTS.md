---
path: /docs/basic-concepts/
redirect_from:
  - /guide/reliability/
---

# Basic concepts

Reakit is established on principles that make it more consistent throughout its components. Understanding these concepts will give you enough base to work with any Reakit component right away.

<carbon-ad></carbon-ad>

## Components

Like any other component library, components are the **highest level API** in Reakit. The [Hidden](/docs/hidden/) component, for example, renders an element that can be hidden or visible.

<!-- eslint-disable -->
```jsx static
<Hidden visible>Hidden</Hidden>
```

## Options

Components receive two kinds of props: **HTML props** and **option props**. Options are just custom props that don't get rendered into the DOM (like `visible`). They affect internal behavior and translate to actual HTML attributes.

<!-- eslint-disable -->
```jsx static
// `className` is an HTML prop
// `visible` is an option
<Hidden className="class" visible />
```

## `as` prop

Components render only one element. You can change its type using the `as` prop:

```jsx
import { Hidden } from "reakit";

function Example() {
  return (
    <Hidden visible as="button">
      Hidden Button
    </Hidden>
  );
}
```

Learn more in [Composition](/docs/composition/#as-prop).

## Render props

Alternatively, you can change the underlying element by passing children as a function (also known as [render props](https://reactjs.org/docs/render-props.html)):

```jsx
import { Hidden, Button } from "reakit";

function Example() {
  return (
    <Hidden visible>
      {props => <Button {...props}>Hidden Button</Button>}
    </Hidden>
  );
}
```

Learn more in [Composition](/docs/composition/#render-props).

## State hooks

Many Reakit components accept state props, and you can plug your own. As a convenience — and because some states need more complex logic —, Reakit provides state hooks out of the box. They receive some options as the initial state and return options needed by their respective components. 

The returned options can be passed as props directly to the components, or used separately to access, update and/or [extend the state](/docs/composition/#state-hooks).

```jsx
import { useHiddenState, Hidden } from "reakit";

function Example() {
  // exposes `visible` state and methods like `show`, `hide` and `toggle`
  const hidden = useHiddenState({ visible: true });
  return (
    <>
      <button onClick={hidden.toggle}>Disclosure</button>
      <Hidden {...hidden}>Hidden</Hidden>
    </>
  );
}
```

Learn more in [Managing state](/docs/managing-state/).

## Props hooks

Finally, as the **lowest level API**, Reakit exposes props hooks. These hooks hold most of the logic behind components and are heavily used within Reakit's source code as a means to compose behaviors without the hassle of polluting the tree with multiple components. For example, [Dialog](/docs/dialog/) uses [Hidden](/docs/hidden/), which in turn uses [Box](/docs/box/).

```jsx
import { useHiddenState, useHidden, useHiddenDisclosure } from "reakit";

function Example() {
  const state = useHiddenState({ visible: true });
  const props = useHidden(state);
  const disclosureProps = useHiddenDisclosure(state);
  return (
    <>
      <button {...disclosureProps}>Disclosure</button>
      <div {...props}>Hidden</div>
    </>
  );
}
```

It's recommended to use the component API whenever possible. But there are two cases where these hooks may be a good fit: 

- You're building a component library and want to leverage composition the same way Reakit does internally.
- You want to compose multiple Reakit components.

Learn more in [Composition](/docs/composition/#props-hooks).
