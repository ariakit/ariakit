---
path: /docs/portal/
redirect_from:
  - /components/portal/
---

# Portal

`Portal` is an abstract wrapper component that uses [React Portals](https://reactjs.org/docs/portals.html) underneath. It can be used to put anything in a portal and supports nested portals.

<carbon-ad></carbon-ad>

## Installation

```sh
npm install reakit
```

Learn more in [Get started](/docs/get-started/).

## Usage

```jsx
import { Portal } from "reakit/Portal";

function Example() {
  return (
    <div style={{ background: "red", color: "white" }}>
      I am here, <Portal>but I am detached at the bottom of the page.</Portal>
    </div>
  );
}
```

## Props

<!-- Automatically generated -->

### `Portal`

- **`unstable_ignoresCustomContext`** <span title="Experimental">⚠️</span>
  <code>boolean | undefined</code>

  Ignores custom `childContext` passed to parent portals.
  ```jsx
  import { Portal } from "reakit/Portal";

  function Example() {
    const ref = React.useRef();
    const [lol, setLol] = React.useState(0);
    React.useEffect(() => setLol(1), [])
    return (
      <Portal unstable_childContext={ref.current}>
        <div ref={ref}>
          <p>portal 0</p>
          <Portal unstable_ignoresCustomContext>portal 1</Portal>
          <Portal>portal 2</Portal>
        </div>
      </Portal>
    );
  }
  ```
