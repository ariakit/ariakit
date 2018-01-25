<img src="logo/logo.png" alt="reas" height="80" />
<br /><br />

[![Generated with nod](https://img.shields.io/badge/generator-nod-2196F3.svg?style=flat-square)](https://github.com/diegohaz/nod)
[![NPM version](https://img.shields.io/npm/v/reas.svg?style=flat-square)](https://npmjs.org/package/reas)
[![Build Status](https://img.shields.io/travis/diegohaz/reas/master.svg?style=flat-square)](https://travis-ci.org/diegohaz/reas) [![Coverage Status](https://img.shields.io/codecov/c/github/diegohaz/reas/master.svg?style=flat-square)](https://codecov.io/gh/diegohaz/reas/branch/master)

-----

A minimalist and highly customizable component system built on top of [React](https://reactjs.org) and [styled-components](https://www.styled-components.com).

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

## Usage

```jsx
import React from 'react'
import { render } from 'react-dom'
import { Block, Popover } from 'reas'

const App = () => (
  <Block>
    <Popover visible>
      <Popover.Arrow />
      Popover
    </Popover>
  </Block>
)

render(<App />, document.getElementById('root'))
```

## License

MIT © [Diego Haz](https://github.com/diegohaz)
