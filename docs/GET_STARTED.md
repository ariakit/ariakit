---
path: /guide/get-started
redirect_from:
  - /guide
---

# Get started

## Installation

First, make sure to have `react` and `react-dom` installed:
```sh
npm install --save react react-dom
```

Then, install `reakit` and `reakit-theme-classic` (optional):
```sh
npm install --save reakit reakit-theme-classic
```

## Usage

Play with an example on [CodeSandbox](https://codesandbox.io/s/m4n32vjkoj).

```jsx static
import React from "react";
import ReactDOM from "react-dom";
import { Provider, Button } from "reakit";
import theme from "reakit-theme-classic";

const App = () => (
  <Provider theme={theme}>
    <Button>Button</Button>
  </Provider>
);

ReactDOM.render(<App />, document.getElementById("root"));
```

## CDN

```html
<html>
<body>
  <div id="root"></div>
  <!-- Peer dependencies -->
  <script src="https://unpkg.com/react@16.4.1/umd/react.development.js"></script>
  <script src="https://unpkg.com/react-dom@16.4.1/umd/react-dom.development.js"></script>
  <script src="https://unpkg.com/prop-types@15.6.2/prop-types.js"></script>
  <!-- Reakit UMD package -->
  <script src="https://unpkg.com/reakit"></script>
  <!-- Usage -->
  <script>
    const { Button } = Reakit;
    const App = React.createElement(Button, {}, "Button");
    ReactDOM.render(App, document.getElementById("root"));
  </script>
</body>
</html>
```