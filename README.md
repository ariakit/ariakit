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

A minimalist and highly customizable UI toolkit built on top of [React](https://reactjs.org) and [styled-components](https://www.styled-components.com).

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

### Popover

<p align="center">
  <img
    src="https://user-images.githubusercontent.com/3068563/35465289-0cb7fe96-02e2-11e8-8bc5-60abcb6e92ac.gif"
    width="200"
  /><br />
  Play with it on <a href="https://codesandbox.io/s/m4n32vjkoj" target="_blank">CodeSandbox</a>
</p>

```jsx
import React from 'react'
import { render } from 'react-dom'
import { InlineBlock, Button, Popover, withPopoverState } from 'reas'

const App = withPopoverState(({ popover }) => (
  <InlineBlock relative>
    <Button as={Popover.Toggle} {...popover}>Toggle</Button>
    <Popover {...popover}>
      <Popover.Arrow />
      Popover
    </Popover>
  </InlineBlock>
))

render(<App />, document.getElementById('root'))
```

### Step

<p align="center">
  <img
    src="https://user-images.githubusercontent.com/3068563/36624496-d9a1fb60-18ee-11e8-81c1-b16b74ed5a7c.gif"
    height="120"
  /><br />
  Play with it on <a href="https://codesandbox.io/s/4090w91mq0" target="_blank">CodeSandbox</a>
</p>

```jsx
import React from 'react'
import { render } from 'react-dom'
import { Block, Flex, Group, Button, Step, withStepState } from 'reas'

const steps = ['Step 1', 'Step 2', 'Step 3', 'Step 4']

const App = withStepState({ current: 0 })(({ step }) => (
  <Flex column alignItems="center" justifyContent="center">
    <Block>
      {steps.map(id => (
        <Step key={id} step={id} {...step}>{id}</Step>
      ))}
    </Block>
    <Group>
      <Button as={Step.Previous} {...step}>
        Previous
      </Button>
      <Button as={Step.Next} {...step}>
        Next
      </Button>
    </Group>
  </Flex>
))

render(<App />, document.getElementById('root'))
```

## License

MIT © [Diego Haz](https://github.com/diegohaz)
