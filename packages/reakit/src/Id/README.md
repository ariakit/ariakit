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
  unstable_useIdState as useIdState,
  unstable_Id as Id
} from "reakit/Id";

function Example() {
  const id = useIdState({ baseId: "items" });
  return (
    <>
      <Id {...id}>Item 1</Id>
      <Id {...id}>Item 2</Id>
    </>
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
