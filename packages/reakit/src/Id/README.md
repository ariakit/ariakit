---
path: /docs/id/
---

# Id

<blockquote experimental="true">
  <strong>This is experimental</strong> and may have breaking changes in minor or patch version updates. Issues for this module will have lower priority. Even so, if you use it, feel free to <a href="https://github.com/reakit/reakit/issues/new/choose" target="_blank">give us feedback</a>.
</blockquote>

Accessible `Group` component that is used to identify a set of user interface objects. It implements the [WAI-ARIA Group Role](https://www.w3.org/TR/wai-aria-1.1/#group).

<carbon-ad></carbon-ad>

## Installation

```sh
npm install reakit
```

Learn more in [Get started](/docs/get-started/).

## Usage

```jsx
import { Group } from "reakit/Group";
import { Button } from "reakit/Button";

function Example() {
  return (
    <Group>
      <Button>Button1</Button>
      <Button>Button2</Button>
      <Button>Button3</Button>
    </Group>
  );
}
```

## Accessibility

- `Group` has role `group`.

Learn more in [Accessibility](/docs/accessibility/).

## Composition

- `Group` uses [Box](/docs/box/).

Learn more in [Composition](/docs/composition/#props-hooks).

## Props

<!-- Automatically generated -->

### `Group`

No props to show
