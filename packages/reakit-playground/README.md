# reakit-playground

<a href="https://npmjs.org/package/reakit-playground"><img alt="NPM version" src="https://img.shields.io/npm/v/reakit-playground.svg?style=flat-square" /></a>

## Installation

```sh
npm i reakit-playground
```

## Usage

```jsx
import React from "react";
import ReactDOM from "react-dom";
import { Provider, Button } from "reakit";
import theme from "reakit-playground";

const App = () => (
  <Provider theme={theme}>
    <Button>Button</Button>
  </Provider>
);

ReactDOM.render(<App />, document.getElementById("root"));
```

## License

MIT © [Diego Haz](https://github.com/diegohaz)
