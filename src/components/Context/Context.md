```jsx
const { Context, Hidden, Button, ContextLogger } = require('reas');

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
  <Context.Provider logger={ContextLogger}>
    <MyButton />
    <MyHidden />
  </Context.Provider>
);

<App />
```