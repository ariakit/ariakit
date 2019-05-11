# reakit-system-bootstrap

<a href="https://npmjs.org/package/reakit-system-bootstrap"><img alt="NPM version" src="https://img.shields.io/npm/v/reakit-system-bootstrap.svg?style=flat-square" /></a>

Reakit system loosely based on [Bootstrap](https://getbootstrap.com/).

> **This is experimental** and may have breaking changes in minor versions.

## Installation

npm:
```sh
npm i reakit-system-bootstrap
```

Yarn:
```sh
yarn add reakit-system-bootstrap
```

## Usage

```jsx
import React from "react";
import ReactDOM from "react-dom";
import { Provider, Button } from "reakit";
import * as system from "reakit-system-bootstrap";

function App() {
  return (
    <Provider unstable_system={system}>
      <Button unstable_system={{ palette: "primary", fill: "outline" }}>
        Button
      </Button>
    </Provider>
  );
}

ReactDOM.render(<App />, document.getElementById("root"));
```

## License

MIT © [Diego Haz](https://github.com/diegohaz)
