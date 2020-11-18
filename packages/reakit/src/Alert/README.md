---
path: /docs/alert/
---

# Alert

TODO

<carbon-ad></carbon-ad>

## Installation

TODO

## Usage

```jsx
import { Alert, useAlertState } from "reakit/Alert";
import { Button } from "reakit/Button";

function Example() {
  const alert = useAlertState({ visible: false });
  return (
    <>
      <Button onClick={alert.toggle}>Toggle</Button>
      <Alert {...alert}>Alert</Alert>
    </>
  );
}
```

### `as` prop

Learn more about the `as` prop in [Composition](/docs/composition/#as-prop).

```jsx
import { Alert, useAlertState } from "reakit/Alert";

function Example() {
  const alert = useAlertState();
  return (
    <Alert {...alert} as="aside">
      Alert
    </Alert>
  );
}
```

### Render props

Learn more about render props in [Composition](/docs/composition/#render-props).

```jsx
import { Alert, useAlertState } from "reakit/Alert";

function Example() {
  const alert = useAlertState();
  return <Alert {...alert}>{(props) => <div {...props}>Alert</div>}</Alert>;
}
```

## Composition

TODO

## Props

<!-- Automatically generated -->

### `useAlertState`

- **`baseId`**
  <code>string</code>

  ID that will serve as a base for all the items IDs.

- **`visible`**
  <code>boolean</code>

  Whether it's visible or not.

### `Alert`

<details><summary>1 state props</summary>

> These props are returned by the state hook. You can spread them into this component (`{...state}`) or pass them separately. You can also provide these props from your own state logic.

- **`visible`**
  <code>boolean</code>

</details>
