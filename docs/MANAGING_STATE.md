---
path: /docs/managing-state/
redirect_from:
  - /guide/state-containers/
---

# Managing state

<carbon-ad></carbon-ad>

Reakit components are pretty much stateless, which means that they need props to be passed in so as to modify their state.

[DisclosureRegion](/docs/disclosure/), for example, is a generic component that can be disclosure or visible based on props:

```jsx
import { DisclosureRegion } from "reakit";

function Example() {
  return <DisclosureRegion visible>Content</DisclosureRegion>;
}
```

You can pass your own state to control it:

```jsx
import React from "react";
import { DisclosureRegion } from "reakit";

function Example() {
  const [visible, setVisible] = React.useState(true);
  return (
    <>
      <button onClick={() => setVisible(!visible)}>Disclosure</button>
      <DisclosureRegion visible={visible}>Content</DisclosureRegion>
    </>
  );
}
```

## State hooks

As a convenience — and because some states need more complex logic —, Reakit provides state hooks out of the box. They receive some options as the initial state and return options needed by their respective components. 

The returned [options](/docs/basic-concepts/#options) can be passed as props directly to the components, or used separately to access, update and/or [extend the state](/docs/composition/#state-hooks).

```jsx
import { useDisclosureState, DisclosureRegion } from "reakit";

function Example() {
  const disclosure = useDisclosureState({ visible: true });
  return (
    <>
      <button onClick={disclosure.toggle}>Disclosure</button>
      <DisclosureRegion {...disclosure}>Content</DisclosureRegion>
    </>
  );
}
```

## Lazy initial state

For lazy initialization, you can pass a function that returns the initial state:

<!-- eslint-disable no-undef -->
```js
useDisclosureState(() => ({ visible: getExpensiveValue() }));
```

## Shared state

If you need to share state between multiple components within your app, you can use [Constate](https://github.com/diegohaz/constate):

```jsx
import { useDisclosureState, Disclosure, DisclosureRegion } from "reakit";
import constate from "constate";

const [DisclosureProvider, useDisclosureContext] = constate(useDisclosureState);

function Button() {
  const disclosure = useDisclosureContext();
  return <Disclosure {...disclosure}>Disclosure</Disclosure>;
}

function Content() {
  const disclosure = useDisclosureContext();
  return <DisclosureRegion {...disclosure}>Content</DisclosureRegion>;
}

function Example() {
  return (
    <DisclosureProvider visible>
      <Button />
      <Content />
    </DisclosureProvider>
  );
}
```
