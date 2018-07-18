## Installation

First, make sure to have `react` and `react-dom` installed:
```sh
npm install --save react react-dom
```

Then, install `reakit`:
```sh
npm install --save reakit
```

## Usage
Play with an example on [CodeSandbox](https://codesandbox.io/s/m4n32vjkoj).
```jsx static
import React from "react";
import ReactDOM from "react-dom";
import { Button } from "reakit";

const App = <Button>Button</Button>;

ReactDOM.render(App, document.getElementById("root"));
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
  <!-- ReaKit UMD package -->
  <script src="https://unpkg.com/reakit"></script>
  <!-- Usage -->
  <script>
    const { Button } = reakit;
    const App = React.createElement(Button, {}, "Button");
    ReactDOM.render(App, document.getElementById("root"));
  </script>
</body>
</html>
```