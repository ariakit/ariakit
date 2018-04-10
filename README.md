<p align="center">
  <br /><br /><br /><br /><br /><br /><br /><br />
  <img src="logo/logo-vertical.png" alt="reas" height="150" />

  <br /><br /><br /><br /><br /><br /><br />
</p>

# reas

<a href="https://github.com/diegohaz/nod"><img alt="Generated with nod" src="https://img.shields.io/badge/generator-nod-2196F3.svg?style=flat-square" /></a>
<a href="https://npmjs.org/package/reas"><img alt="NPM version" src="https://img.shields.io/npm/v/reas.svg?style=flat-square" /></a>
<a href="https://travis-ci.org/diegohaz/reas"><img alt="Build Status" src="https://img.shields.io/travis/diegohaz/reas/master.svg?style=flat-square" /></a>
<a href="https://codecov.io/gh/diegohaz/reas/branch/master"><img alt="Coverage Status" src="https://img.shields.io/codecov/c/github/diegohaz/reas/master.svg?style=flat-square" /></a>

Minimalist and highly composable building blocks built on top of [React](https://reactjs.org) and [styled-components](https://www.styled-components.com).

- [**Documentation**](https://diegohaz.github.io/reas/)
- [**Components**](https://diegohaz.github.io/reas/#components)

## Install

Yarn:
```sh
yarn add reas
```

npm:
```sh
npm install --save reas
```

## Examples

### Simple Popover

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
import { InlineBlock, Button, Popover } from "reas";

const App = () => (
  <Popover.State>
    {popover => (
      <InlineBlock relative>
        <Button as={Popover.Toggle} {...popover}>Toggle</Button>
        <Popover {...popover}>
          <Popover.Arrow />
          Popover
        </Popover>
      </InlineBlock>
    )}
  </Popover.State>
);

render(<App />, document.getElementById("root"));
```

## Performance

Benchmark done using [react-benchmark](https://github.com/Rowno/react-benchmark) with MacBook Pro (Retina, 13-inch, Late 2013). Clone the repository and run `yarn && yarn benchmark` to see the results.

| Library | ops/sec |
| ------- | -------:|
| [react](benchmark/cases/react.js) | 103,029 |
| [reas (`as`)](benchmark/cases/reas-as.js) | 45,975 |
| [antd](https://github.com/ant-design/ant-design) | 29,122 |
| [reas (`Base`)](benchmark/cases/reas-base.js) | 17,071 |
| [reas (`Box`)](benchmark/cases/reas-box.js) | 13,163 |
| [material-ui](https://github.com/mui-org/material-ui) | 9,840 |
| [rebass](https://github.com/jxnblk/rebass) | 7,989 |


## License

MIT © [Diego Haz](https://github.com/diegohaz)
