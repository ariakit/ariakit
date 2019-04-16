# reakit-playground

<a href="https://npmjs.org/package/reakit-playground"><img alt="NPM version" src="https://img.shields.io/npm/v/reakit-playground.svg?style=flat-square" /></a>

## Installation

npm:
```sh
npm i reakit-playground
```

Yarn:
```sh
yarn add reakit-playground
```

## Usage

```jsx
import React from "react";
import ReactDOM from "react-dom";
import {
  usePlaygroundState,
  PlaygroundEditor,
  PlaygroundPreview
} from "reakit-playground";

const initialCode = `import React from "react";
import { Provider, Button } from "reakit";

function Example() {
  return (
    <Provider>
      <Button>Button</Button>
    </Provider>
  );
}
`;

function App() {
  const playground = usePlaygroundState({ code: initialCode });
  return (
    <div>
      <PlaygroundPreview {...playground} />
      <PlaygroundEditor {...playground} readOnly />
    </div>
  );
}

ReactDOM.render(<App />, document.getElementById("root"));
```

## License

MIT © [Diego Haz](https://github.com/diegohaz)
