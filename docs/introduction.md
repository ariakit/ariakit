`reas` is a component system library built on top of [React](https://reactjs.org/) and [styled-components](https://www.styled-components.com/). The following principles were used to design it:

<br /><br />

### One component is one element
No need to pass `innerComponentClassName` or any other props to nested components, because they don't exist.
```js { "showCode": true }
const { Block, Popover, Tooltip } = require('reas');

<Block relative>
  <Popover visible>
    <Popover.Arrow />
    Popover
  </Popover>
</Block>
```

<br /><br />

### A component can be rendered [`as`](#as) any html element
This is useful when you want to render a `Button` as an anchor element, for example.
```js { "showCode": true }
const { Button } = require('reas');

<Button as="a" href="https://google.com" target="_Blank">Go to Google Website</Button>
```

<br /><br />

### A component can be rendered [`as`](#as) any other React component
With that, you can render a `Button` as [`react-router`](https://reacttraining.com/react-router/)'s `Link`, for example. But, specially for `reas`, this is important so you can use [behaviors](#behaviors).
```js { "showCode": true }
const { Button, Input } = require('reas');

<Button as={Input} placeholder="Input" />
```

<br /><br />

### A component can be rendered [`as`](#as) multiple other components
Thus, even though a `Block` is a `div`, you can render it as a `span`.
```js { "showCode": true }
const { Button, Block } = require('reas');

<Button as={[Block, 'span']}>I'm a clickable/focusable span with display:block</Button>
```

<br /><br />

### A component can be [styled](#styling) with props
Just an alternative to `style={{ ... }}`.
```js { "showCode": true }
const { Button } = require('reas');

<Button relative backgroundColor="palevioletred" color="white">Button</Button>
```

<br /><br />

### A component can be [styled](#styling) by extending another component
Using [styled-components](https://www.styled-components.com/).
```js { "showCode": true }
const { Button } = require('reas');

const StyledButton = Button.extend`
  position: relative;
  background-color: palevioletred;
  color: white;
`;

<StyledButton as="a" href="#button">Button</StyledButton>
```

<br /><br />

### A `reas` component can be created by using [`as`](#as) enhancer
Take advantage of all above features in your components.
```js { "showCode": true }
const as = require('reas').default;

const enhance = as('span'); // default to span
const MyComponent = enhance(({ as: T, ...props }) => <T {...props} />);

<MyComponent as="div" backgroundColor="palevioletred" color="white">MyComponent</MyComponent>
```

<br /><br />

### A component state can be handled by using [state](#state) enhancers
State enhancers encapsulate the complexity behind state logic.
```js { "showCode": true }
const { Block, Button, Hidden, withHiddenState } = require('reas');

const enhance = withHiddenState();
const Example = enhance(({ hidden }) => (
  <Block>
    <Button onClick={() => hidden.toggle()}>Toggle</Button>
    <Hidden visible={hidden.visible}>Hidden</Hidden>
  </Block>
));

<Example />
```

<br /><br />

### A component API can be encapsulated by using [behavior](#behaviors) components
Behaviors such as `Hidden.Toggle` apply event handlers automatically.
```js { "showCode": true }
const { Block, Button, Hidden, withHiddenState } = require('reas');

const enhance = withHiddenState();
const Example = enhance(({ hidden }) => (
  <Block>
    <Button as={Hidden.Toggle} {...hidden}>Toggle</Button>
    <Hidden {...hidden}>Hidden</Hidden>
  </Block>
));

<Example />
```
