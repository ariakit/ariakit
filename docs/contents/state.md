All `reas` components are stateless, which means that they need props to be passed in so as to modify their state.

[`Hidden`](#hidden), for example, is a generic component that can be hidden or visible, and that's controlled by props:
```jsx { "showCode": true }
const { Hidden } = require('reas');

<Hidden visible destroy>Remove visible prop</Hidden>
```

If you pass in a `hideOnEsc` prop, you will need to provide a `hide` function so the component will know how to hide itself when `esc` is pressed. In this example, we will be using [`recompose`](https://github.com/acdlite/recompose) as state manager.
```jsx { "showCode": true }
const { Hidden } = require('reas');
const { withStateHandlers } = require('recompose');

const enhance = withStateHandlers(
  { visible: true },
  { hide: () => () => ({ visible: false }) }
);

const Example = enhance(({ visible, hide }) => (
  <Hidden
    destroy
    hideOnEsc
    visible={visible}
    hide={hide}
  >
    Press esc
  </Hidden>
));

<Example />
```

As a convenience, `reas` provides state components so you don't need to worry about it. Here's the same as above but using `Hidden.State` (refresh the page if you have already pressed esc):
```jsx { "showCode": true }
const { Hidden } = require('reas');

const Example = () => (
  <Hidden.State initialState={{ visible: true }}>
    {({ visible, hide }) => (
      <Hidden
        destroy
        hideOnEsc
        visible={visible}
        hide={hide}
      >
        Press esc
      </Hidden>
    )}
  </Hidden.State>
);

<Example />
```

### Global state

To be able to handle global state in your application, we need to use [`Context`](#context). First you must wrap your root component with `Context.Provider` so as to hold the global state:

```jsx static
import React from 'react'
import { render } from 'react-dom'
import { Context, stateLogger } from 'reas'

// optional logger
const logger = process.env.NODE_ENV === 'development' && stateLogger

const App = () => (
  <Context.Provider logger={logger}>
    ...
  </Context.Provider
)

render(<App />, document.getElementById('root'))
```

On your components, you can use the same `Component.State`, but with an additional property `context`:

```jsx static
import React from 'react'
import { Hidden } from 'reas'

const MyHidden = () => (
  <Hidden.State context="foo" initialState={{ visible: true }}>
    {({ visible, hide }) => (
      <Hidden
        destroy
        hideOnEsc
        visible={visible}
        hide={hide}
      >
        Press esc
      </Hidden>
    )}
  </Hidden.State>
)
```