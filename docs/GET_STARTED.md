---
path: /docs/get-started/
redirect_from:
  - /docs/
  - /guide/get-started/
---

# Get started

Reakit is a low level component library for building accessible high level UI libraries, design systems and applications with React.

## Installation

First, make sure to have `react` and `react-dom` installed:
```sh
npm install react react-dom
```

Then, install `reakit`:
```sh
npm install reakit
```

## Usage

Play with an example on [CodeSandbox](https://codesandbox.io/s/m4n32vjkoj).

The code below will render an **unstyled** [Button](/docs/button/).

```jsx static
import React from "react";
import ReactDOM from "react-dom";
import { Button } from "reakit/Button";

function App() {
  return <Button>Button</Button>;
}

ReactDOM.render(<App />, document.getElementById("root"));
```

### Server Side Rendering

If you need SSR support, you must wrap your app with Reakit `Provider`. It will generate deterministic IDs for accessibility purposes both on the server and client.

```jsx static
import { Provider, Button } from "reakit";

function App() {
  return (
    <Provider>
      <Button>Button</Button>
    </Provider>
  );
}
```

### Default styles

If you want to include default styles, you can use the **experimental** system feature with [`reakit-system-bootstrap`](https://github.com/reakit/reakit/tree/next/packages/reakit-system-bootstrap#readme). The code below will render a button with bootstrap-like styling.

```jsx static
import { Provider, Button } from "reakit";
import * as system from "reakit-system-bootstrap";

function App() {
  return (
    <Provider unstable_system={system}>
      <Button>Button</Button>
    </Provider>
  );
}
```

All the interactive examples in this documentation use [`reakit-system-bootstrap`](https://github.com/reakit/reakit/tree/next/packages/reakit-system-bootstrap#readme) by default.

## CDN

You can also use the UMD version of Reakit. Play with an example on [JSBin](https://jsbin.com/celiwun/edit?html,output).

```html
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width">
  <title>Reakit</title>
</head>
<body>
  <div id="root"></div>
  <!-- Peer dependencies -->
  <script src="https://unpkg.com/react/umd/react.development.js"></script>
  <script src="https://unpkg.com/react-dom/umd/react-dom.development.js"></script>
  <!-- Reakit UMD package -->
  <script src="https://unpkg.com/reakit"></script>
  <script src="https://unpkg.com/reakit-system-bootstrap"></script>
  <!-- Usage -->
  <script>
    const App = React.createElement(
      Reakit.Provider, 
      { unstable_system: ReakitSystemBootstrap }, 
      React.createElement(Reakit.Button, {}, "Button")
    );
    ReactDOM.render(App, document.getElementById("root"));
  </script>
</body>
</html>
```
