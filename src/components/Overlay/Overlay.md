```jsx
const { Block, Button, Backdrop } = require('reakit');

const Example = () => (
  <Overlay.Container>
    {overlay => (
      <Block>
        <Button as={Overlay.Show} {...overlay}>Click me</Button>
        <Backdrop fade as={Overlay.Hide} {...overlay} />
        <Overlay fade slide {...overlay}>Overlay</Overlay>
      </Block>
    )}
  </Overlay.Container>
);

<Example />
```
