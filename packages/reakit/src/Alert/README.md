---
path: /docs/Alert/
---

# Alert

`Alert` is the most abstract component on top of which all other Reakit components are built. By default, it renders a `div` element.

<carbon-ad></carbon-ad>

## Installation

```sh
npm install reakit
```

Learn more in [Get started](/docs/get-started/).

## Usage

```jsx
import { Alert } from "reakit/Alert";

function Example() {
  return <Alert>Alert</Alert>;
}
```

### `as` prop

Learn more about the `as` prop in [Composition](/docs/composition/#as-prop).

```jsx
import { Alert } from "reakit/Alert";

function Example() {
  return <Alert as="aside">Button</Alert>;
}
```

### Render props

Learn more about render props in [Composition](/docs/composition/#render-props).

```jsx
import { Alert } from "reakit/Alert";

function Example() {
  return <Alert>{(props) => <button {...props}>Button</button>}</Alert>;
}
```

## Composition

- `Alert` is used by all Reakit components.

Learn more in [Composition](/docs/composition/#props-hooks).

## Props

<!-- Automatically generated -->

### `Alert`

No props to show
