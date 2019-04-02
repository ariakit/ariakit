# reakit-system-palette

<a href="https://npmjs.org/package/reakit-system-palette"><img alt="NPM version" src="https://img.shields.io/npm/v/reakit-system-palette.svg?style=flat-square" /></a>

Create color themes for Reakit components.

> **This is experimental** and may have breaking changes in minor versions.

## Installation

npm:
```sh
npm i reakit-system-palette
```

Yarn:
```sh
yarn add reakit-system-palette
```

## Setup

```jsx
import React from "react";
import ReactDOM from "react-dom";
import { Provider, Button } from "reakit";
import * as system from "reakit-system-palette";

function App() {
  return (
    <Provider unstable_system={system}>
      <Button unstable_system={{ palette: "primary", fill: "opaque" }}>
        Button
      </Button>
    </Provider>
  );
}

ReactDOM.render(<App />, document.getElementById("root"));
```

## License

MIT © [Diego Haz](https://github.com/diegohaz)
