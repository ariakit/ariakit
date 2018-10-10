> Reakit uses [Constate](https://github.com/diegohaz/constate) to provide a state management system.

Reakit components are generally stateless, which means that they need props to be passed in so as to modify their state.

[Hidden](../packages/reakit/src/Hidden/Hidden.md), for example, is a generic component that can be hidden or visible based on props:
```jsx
import { Hidden } from "reakit";

<Hidden visible>Hidden</Hidden>
```

If you pass in a `hideOnEsc` or `hideOnClickOutside` prop, you'll need to provide a `hide` function so the component will know how to hide itself when `esc` is pressed or when you click outside the component.
```jsx
import { Hidden } from "reakit";

class Example extends React.Component {
  constructor(props) {
    super(props)
    this.state = { visible: true };
    this.hide = () => this.setState({ visible: false });
  }

  render() {
    return (
      <Hidden
        hideOnEsc
        hideOnClickOutside
        visible={this.state.visible}
        hide={this.hide}
      >
        Hidden
      </Hidden>
    )
  }
};

<Example />
```

As a convenience, Reakit provides handful containers so you don't need to worry about it. Here's the same as above but using [HiddenContainer](../packages/reakit/src/Hidden/HiddenContainer.md):
```jsx
import { Hidden } from "reakit";

<Hidden.Container initialState={{ visible: true }}>
  {({ visible, hide }) => (
    <Hidden
      hideOnEsc
      hideOnClickOutside
      visible={visible}
      hide={hide}
    >
      Hidden
    </Hidden>
  )}
</Hidden.Container>
```

### Global state

To be able to handle global state within your application, you must wrap your root component with `Provider` and pass an additional property `context` to your `Container`s:

```jsx
import { Provider, Button, Hidden } from 'reakit'

const HiddenButton = () => (
  <Hidden.Container context="hidden1">
    {hidden => <Hidden.Toggle as={Button} {...hidden}>Toggle</Hidden.Toggle>}
  </Hidden.Container>
);

const HiddenElement = () => (
  <Hidden.Container context="hidden1">
    {hidden => <Hidden {...hidden}>Hidden</Hidden>}
  </Hidden.Container>
);

<Provider>
  <HiddenButton />
  <HiddenElement />
</Provider>
```
