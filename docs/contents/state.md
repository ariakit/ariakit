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
  <Hidden destroy hideOnEsc visible={visible} hide={hide}>Press esc</Hidden>
));

<Example />
```

As a convenience, `reas` provides state enhancers so you don't need to worry about it. Here's the same as above but using `withHiddenState` (refresh the page if you have already pressed esc):
```jsx { "showCode": true }
const { Hidden } = require('reas');

const Example = () => (
  <Hidden.State visible>
    {hidden => (
      <Hidden destroy hideOnEsc {...hidden}>Press esc</Hidden>
    )}
  </Hidden.State>
);

<Example />
```
