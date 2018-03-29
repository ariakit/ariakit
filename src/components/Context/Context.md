```jsx
const { Context, Hidden, Button, stateLogger } = require('reas');

const MyButton = () => (
  <Hidden.State context="foo">
    {hidden => <Button as={Hidden.Toggle} {...hidden}>Toggle</Button>}
  </Hidden.State>
);

const MyHidden = () => (
  <Hidden.State context="foo">
    {hidden => <Hidden {...hidden}>Hidden</Hidden>}
  </Hidden.State>
);

const App = () => (
  <Context.Provider logger={stateLogger}>
    <MyButton />
    <MyHidden />
  </Context.Provider>
);

<App />
```