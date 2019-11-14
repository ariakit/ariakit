---
path: /docs/id/
---

# Id

<blockquote experimental="true">
  <strong>This is experimental</strong> and may have breaking changes in minor or patch version updates. Issues for this module will have lower priority. Even so, if you use it, feel free to <a href="https://github.com/reakit/reakit/issues/new/choose" target="_blank">give us feedback</a>.
</blockquote>

`Id` is a component that renders an element with an automatically generated `id` attribute that is consistent across server and client. It's used by several other components.

<carbon-ad></carbon-ad>

## Installation

```sh
npm install reakit
```

Learn more in [Get started](/docs/get-started/).

## Usage

```jsx
import {
  unstable_IdProvider as IdProvider,
  unstable_Id as Id
} from "reakit/Id";

function Example() {
  return (
    <IdProvider>
      <Id>{props => <div {...props}>{props.id}</div>}</Id>
      <Id>{props => <div {...props}>{props.id}</div>}</Id>
    </IdProvider>
  );
}
```

### `useIdState`

```jsx
import {
  unstable_useIdState as useIdState,
  unstable_Id as Id
} from "reakit/Id";

function Example() {
  const id = useIdState({ baseId: "a" });
  return (
    <>
      <Id {...id}>{props => <div {...props}>{props.id}</div>}</Id>
      <Id {...id}>{props => <div {...props}>{props.id}</div>}</Id>
      <Id {...id} id="different-id">
        {props => <div {...props}>{props.id}</div>}
      </Id>
      <Id {...id}>{props => <div {...props}>{props.id}</div>}</Id>
    </>
  );
}
```

### `IdGroup`

```jsx
import {
  unstable_useIdState as useIdState,
  unstable_IdGroup as IdGroup,
  unstable_Id as Id
} from "reakit/Id";

function Example() {
  const id = useIdState();
  return (
    <IdGroup {...id} id="a">
      <Id {...id}>{props => <div {...props}>{props.id}</div>}</Id>
      <Id {...id}>{props => <div {...props}>{props.id}</div>}</Id>
      <Id {...id} id="different-id">
        {props => <div {...props}>{props.id}</div>}
      </Id>
      <Id {...id}>{props => <div {...props}>{props.id}</div>}</Id>
    </IdGroup>
  );
}
```

### `useId`

```jsx
import {
  unstable_IdProvider as IdProvider,
  unstable_useId as useId
} from "reakit/Id";

function Item(props) {
  const { id } = useId(props);
  return (
    <div {...props} id={id}>
      {id}
    </div>
  );
}

function Example() {
  return (
    <IdProvider prefix="a">
      <Item />
      <Item />
      <Item id="different-id" />
      <Item />
    </IdProvider>
  );
}
```

## Accessibility

`Id` renders unique and consistent `id` attributes so they can be used in several `aria-` props.

Learn more in [Accessibility](/docs/accessibility/).

## Composition

- `Id` uses [Box](/docs/box/).

Learn more in [Composition](/docs/composition/#props-hooks).

## Props

<!-- Automatically generated -->

### `useIdState`

No props to show

### `Id`

- **`id`**
  <code>string | undefined</code>

  Same as the HTML attribute.

### `IdGroup`

- **`id`**
  <code>string | undefined</code>

  Same as the HTML attribute.
