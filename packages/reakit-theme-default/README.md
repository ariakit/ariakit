# reakit-theme-default

<a href="https://npmjs.org/package/reakit-theme-default"><img alt="NPM version" src="https://img.shields.io/npm/v/reakit-theme-default.svg?style=flat-square" /></a>

## Installation

```sh
npm i reakit-theme-default
```

## Usage

```jsx
import React from "react";
import ReactDOM from "react-dom";
import { Provider, Button } from "reakit";
import theme from "reakit-theme-default";

const App = () => (
  <Provider theme={theme}>
    <Button>Button</Button>
  </Provider>
);

ReactDOM.render(<App />, document.getElementById("root"));
```

## License

MIT © [Diego Haz](https://github.com/diegohaz)
