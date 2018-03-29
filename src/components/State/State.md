```jsx
const { Button, stateLogger } = require('reas');

const actions = {
  increment: amount => state => ({ n: state.n + amount }),
};

const selectors = {
  getParity: () => state => state.n % 2 === 0 ? 'even' : 'odd'
};

const MyState = props => (
  <State
    {...props}
    actions={actions}
    selectors={selectors}
    stateKeys={['n']} 
  />
);

<MyState n={5} logger={stateLogger}>
  {({ increment, n, getParity }) => (
    <Button onClick={() => increment(1)}>{n} {getParity()}</Button>
  )}
</MyState>
```