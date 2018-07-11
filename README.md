<p align="center">
  <br><br><br>
  <img src="logo/logo.png" alt="reakit" width="400" />
  <br><br><br><br>
  <a href="https://github.com/diegohaz/nod"><img alt="Generated with nod" src="https://img.shields.io/badge/generator-nod-2196F3.svg?style=flat-square" /></a>
  <a href="https://npmjs.org/package/reakit"><img alt="NPM version" src="https://img.shields.io/npm/v/reakit.svg?style=flat-square" /></a>
  <a href="https://travis-ci.org/diegohaz/reakit"><img alt="Build Status" src="https://img.shields.io/travis/diegohaz/reakit/master.svg?style=flat-square" /></a>
  <a href="https://codecov.io/gh/diegohaz/reakit/branch/master"><img alt="Coverage Status" src="https://img.shields.io/codecov/c/github/diegohaz/reakit/master.svg?style=flat-square" /></a>
</p>

---

Toolkit for building [composable](https://reakit.io/guide/principles/composability), [accessible](https://reakit.io/guide/principles/accessibility) and [reliable](https://reakit.io/guide/principles/reliability) UIs with [React](https://reactjs.org/).

- 🌎 [**Website**](https://reakit.io)
- 📖 [**Guide**](https://reakit.io/guide)
- 📦 [**Components**](https://reakit.io/components)

## Installation

```sh
npm i reakit
```

> Thanks to [@nosebit](https://github.com/nosebit) for the package name on npm.

## Example

<p align="center">
  <img
    src="https://user-images.githubusercontent.com/3068563/35465289-0cb7fe96-02e2-11e8-8bc5-60abcb6e92ac.gif"
    width="200"
  /><br />
  See and edit full source code on <a href="https://codesandbox.io/s/m4n32vjkoj">CodeSandbox</a>
</p>

```jsx
import React from "react";
import { render } from "react-dom";
import { Button, Popover } from "reakit";

const App = () => (
  <Popover.Container>
    {popover => (
      <Button as={Popover.Toggle} {...popover}>
        Toggle
        <Popover {...popover}>
          <Popover.Arrow />
          Popover
        </Popover>
      </Button>
    )}
  </Popover.Container>
);

render(<App />, document.getElementById("root"));
```

## Performance

Benchmark done using [react-benchmark](https://github.com/Rowno/react-benchmark) with MacBook Pro (Retina, 13-inch, Late 2013). Clone the repository and run `yarn && yarn benchmark` to see the results.

| Library | ops/sec |
| ------- | -------:|
| [react](benchmark/cases/react.js) | 103,029 |
| [reakit (`as`)](benchmark/cases/reakit-as.js) | 45,975 |
| [antd](https://github.com/ant-design/ant-design) | 29,122 |
| [reakit (`Base`)](benchmark/cases/reakit-base.js) | 17,071 |
| [reakit (`Button`)](benchmark/cases/reakit-button.js) | 12,107 |
| [material-ui](https://github.com/mui-org/material-ui) | 9,840 |
| [rebass](https://github.com/jxnblk/rebass) | 7,989 |


## License

MIT © [Diego Haz](https://github.com/diegohaz)
