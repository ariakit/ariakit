---
path: /docs/managing-state/
redirect_from:
  - /guide/state-containers/
---

# Managing state

<carbon-ad></carbon-ad>

Reakit components are pretty much stateless, which means that they need props to be passed in so as to modify their state.

[Hidden](/docs/hidden/), for example, is a generic component that can be hidden or visible based on props:

```jsx
import { Hidden } from "reakit";

function Example() {
  return <Hidden visible>Hidden</Hidden>;
}
```

You can pass your own state to control it:

```jsx
import React from "react";
import { Hidden } from "reakit";

function Example() {
  const [visible, setVisible] = React.useState(true);
  return (
    <>
      <button onClick={() => setVisible(!visible)}>Disclosure</button>
      <Hidden visible={visible}>Hidden</Hidden>
    </>
  );
}
```

## State hooks

As a convenience — and because some states need more complex logic —, Reakit provides state hooks out of the box. They receive some options as the initial state and return options needed by their respective components. 

The returned [options](/docs/basic-concepts/#options) can be passed as props directly to the components, or used separately to access, update and/or [extend the state](/docs/composition/#state-hooks).

```jsx
import { useHiddenState, Hidden } from "reakit";

function Example() {
  const hidden = useHiddenState({ visible: true });
  return (
    <>
      <button onClick={hidden.toggle}>Disclosure</button>
      <Hidden {...hidden}>Hidden</Hidden>
    </>
  );
}
```

## Lazy initial state

For lazy initialization, you can pass a function that returns the initial state:

<!-- eslint-disable no-undef -->
```js
useHiddenState(() => ({ visible: getExpensiveValue() }));
```

## Shared state

If you need to share state between multiple components within your app, you can use [Constate](https://github.com/diegohaz/constate):

```jsx
import { useHiddenState, Hidden, HiddenDisclosure } from "reakit";
import createUseContext from "constate";

const useHiddenContext = createUseContext(useHiddenState);

function Disclosure() {
  const hidden = useHiddenContext();
  return <HiddenDisclosure {...hidden}>Disclosure</HiddenDisclosure>;
}

function HiddenElement() {
  const hidden = useHiddenContext();
  return <Hidden {...hidden}>Hidden</Hidden>;
}

function Example() {
  return (
    <useHiddenContext.Provider visible>
      <Disclosure />
      <HiddenElement />
    </useHiddenContext.Provider>
  );
}
```
