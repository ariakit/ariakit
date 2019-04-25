---
path: /docs/key-binder
---

# KeyBinder

> **This is experimental** and may have breaking changes in minor or patch version updates. Issues for this module will have lower priority. Even so, if you use it, feel free to [give us feedback](https://github.com/reakit/reakit/issues/new/choose).

`KeyBinder` is an abstract component that adds key bindings to other components.

## Installation

```sh
npm install reakit
```

Learn more in [Get started](/docs/get-started).

## Usage

```jsx
import React from "react";
import { unstable_KeyBinder as KeyBinder } from "reakit/KeyBinder";

function Example() {
  const [count, setCount] = React.useState(0);
  return (
    <KeyBinder tabIndex={0} keyMap={{ Enter: () => setCount(count + 1) }}>
      {count}
    </KeyBinder>
  );
}
```

### Composing with other components

It's better used in combination with other components:

```jsx
import { unstable_useKeyBinder as useKeyBinder } from "reakit/KeyBinder";
import { Hidden, HiddenDisclosure, useHiddenState } from "reakit/Hidden";

function Example() {
  const hidden = useHiddenState();
  const keybindings = useKeyBinder({ keyMap: { a: hidden.toggle } });
  return (
    <>
      <HiddenDisclosure {...hidden} {...keybindings}>
        {`Press "a" to toggle`}
      </HiddenDisclosure>
      <Hidden {...hidden}>Yaay!</Hidden>
    </>
  );
}
```

## Composition

- `KeyBinder` is used by [Menu](/docs/menu) and [MenuDisclosure](/docs/menu).

Learn more in [Composition](/docs/composition#props-hooks).

## Props

<!-- Automatically generated -->

### `KeyBinder`

| Name | Type | Description |
|------|------|-------------|
| <strong><code>keyMap</code>&nbsp;</strong> | <code title="{ [key: string]: false &#124; ((event: KeyboardEvent&#60;any&#62;) =&#62; any) &#124; null &#124; undefined; } &#124; undefined">{&nbsp;[key:&nbsp;string]:&nbsp;false&nbsp;&#124;&nbsp;((...</code> | TODO: Description |
| <strong><code>onKey</code>&nbsp;</strong> | <code title="((event: KeyboardEvent&#60;any&#62;) =&#62; any) &#124; undefined">((event:&nbsp;KeyboardEvent&#60;any&#62;...</code> | TODO: Description |
| <strong><code>preventDefault</code>&nbsp;</strong> | <code>boolean&nbsp;&#124;&nbsp;undefined</code> | TODO: Description |
| <strong><code>stopPropagation</code>&nbsp;</strong> | <code>boolean&nbsp;&#124;&nbsp;undefined</code> | TODO: Description |
