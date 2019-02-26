# reakit-system-classic

<a href="https://npmjs.org/package/reakit-system-classic"><img alt="NPM version" src="https://img.shields.io/npm/v/reakit-system-classic.svg?style=flat-square" /></a>

## Installation

```sh
npm i reakit-system-classic
```

## Usage

```jsx
import React from "react";
import ReactDOM from "react-dom";
import { Provider, Button } from "reakit";
import system from "reakit-system-classic";

const App = () => (
  <Provider system={system}>
    <Button>Button</Button>
  </Provider>
);

ReactDOM.render(<App />, document.getElementById("root"));
```

## License

MIT © [Diego Haz](https://github.com/diegohaz)
