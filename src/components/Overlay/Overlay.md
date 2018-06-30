```jsx
const { Block, Button, Backdrop } = require('reas');

const Example = () => (
  <Overlay.Container>
    {overlay => (
      <Block>
        <Button as={Overlay.Show} {...overlay}>Click me</Button>
        <Backdrop as={Overlay.Hide} {...overlay} />
        <Overlay {...overlay}>Overlay</Overlay>
      </Block>
    )}
  </Overlay.Container>
);

<Example />
```
