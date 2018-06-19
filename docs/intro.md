### One component is one element
There are no encapsulated nested components. No need to pass `nestedComponentProps`. You have direct access to any component that can be part of another one, such as `Popover.Arrow`.
```jsx { "showCode": true, "size": "80px" }
const { Block, Popover } = require('reakit');

<Block relative>
  <Popover visible>
    <Popover.Arrow />
    Try to remove Popover.Arrow above.
  </Popover>
</Block>
```

### A component can be rendered [`as`](#as) any html element
This is useful when you want to render a `Button` as an anchor element, for example.
```jsx
const { Button } = require('reakit');

<Button as="a" href="https://google.com" target="_Blank">Go to Google Website</Button>
```

### A component can be rendered [`as`](#as) any other React component
With that, you can render a `Button` as [`react-router`](https://reacttraining.com/react-router/)'s `Link`, for example. But, specially for ReaKit, this is important so you can use [behaviors](#behaviors).
```jsx
const { Button, Hidden } = require('reakit');

// remove visible prop
<Button as={Hidden} visible>I'm a button that can be hidden</Button>
```

### A component can be rendered [`as`](#as) multiple other components
You can combine multiple components to create neat compositions.
```jsx
const { Button, Hidden } = require('reakit');

<Button as={[Hidden, 'span']} visible>I'm a clickable/focusable span that can be hidden</Button>
```

### A component can be [styled](#styling) with props
Just an alternative to `style={{ ... }}`.
```jsx
const { Button } = require('reakit');

<Button relative backgroundColor="palevioletred" color="white">Button</Button>
```

### A component can be [styled](#styling) by extending another component
Using [styled-components](https://www.styled-components.com/).
```jsx
const { styled, Button } = require('reakit');

const StyledButton = styled(Button)`
  position: relative;
  background-color: palevioletred;
  color: white;
`;

<StyledButton as="a" href="#button">Button</StyledButton>
```

### A ReaKit component can be created by using [`as`](#as) enhancer
Take advantage of all above features in your components.
```jsx
const { as } = require('reakit');

const enhance = as('span');
const Example = enhance(({ as: T, ...props }) => <T {...props} />);

<Example as="div" backgroundColor="palevioletred" color="white">Example</Example>
```

### A component state can be handled by using [container](#containers) components
Containers encapsulate the complexity behind state logic.
```jsx
const { Block, Button, Hidden } = require('reakit');

const Example = () => (
  <Hidden.Container>
    {hidden => (
      <Block>
        <Button onClick={hidden.toggle}>Toggle</Button>
        <Hidden visible={hidden.visible}>Hidden</Hidden>
      </Block>
    )}
  </Hidden.Container>
);

<Example />
```

### A component API can be encapsulated by using [behavior](#behaviors) components
Behaviors such as `Hidden.Toggle` apply event handlers automatically.
```jsx
const { Block, Button, Hidden } = require('reakit');

const Example = () => (
  <Hidden.Container>
    {hidden => (
      <Block>
        <Button as={Hidden.Toggle} {...hidden}>Toggle</Button>
        <Hidden {...hidden}>Hidden</Hidden>
      </Block>
    )}
  </Hidden.Container>
);

<Example />
```
