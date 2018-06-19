All ReaKit components are stateless, which means that they need props to be passed in so as to modify their state.

[`Hidden`](#hidden), for example, is a generic component that can be hidden or visible, and that's controlled by props:
```jsx { "showCode": true }
const { Hidden } = require('reakit');

<Hidden visible destroy>Remove visible prop</Hidden>
```

If you pass in a `hideOnEsc` prop, you will need to provide a `hide` function so the component will know how to hide itself when `esc` is pressed.
```jsx { "showCode": true }
const { Hidden } = require('reakit');

class Example extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      visible: true
    }
    this.hide = () => this.setState({ visible: false })
  }

  render() {
    return (
      <Hidden
        destroy
        hideOnEsc
        visible={this.state.visible}
        hide={this.hide}
      >
        Press esc
      </Hidden>
    )
  }
};

<Example />
```

As a convenience, ReaKit provides containers so you don't need to worry about it. Here's the same as above but using `Hidden.Container` (refresh the page if you have already pressed esc):
```jsx { "showCode": true }
const { Hidden } = require('reakit');

const initialState = { visible: true }

const Example = () => (
  <Hidden.Container initialState={initialState}>
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
  </Hidden.Container>
);

<Example />
```

### Global state

To be able to handle global state within your application, you need to `Provider`. First you must wrap your root component with `Provider` so as to hold the global state:

```jsx static
import React from 'react'
import { render } from 'react-dom'
import { Provider } from 'reakit'


const App = () => (
  <Provider>
    ...
  </Provider>
)

render(<App />, document.getElementById('root'))
```

On your components, you can use the same `Component.Container`, but with an additional property `context`:

```jsx static
import React from 'react'
import { Hidden } from 'reakit'

const initialState = { visible: true }

const MyHidden = () => (
  <Hidden.Container context="foo" initialState={initialState}>
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
  </Hidden.Container>
)
```