`Overlay` is by default fixed on the middle of the screen.

```jsx
const { Block, Button, Backdrop } = require('reakit');

<Overlay.Container>
  {overlay => (
    <Block>
      <Button as={Overlay.Show} {...overlay}>Click me</Button>
      <Backdrop fade as={Overlay.Hide} {...overlay} />
      <Overlay fade slide {...overlay}>Overlay</Overlay>
    </Block>
  )}
</Overlay.Container>
```

This is usually combined with [Portal](/components/portal) so it can be dettached from the DOM hierarchy:

```jsx
const { Block, Button, Backdrop, Portal } = require('reakit');

<Overlay.Container>
  {overlay => (
    <Block>
      <Button as={Overlay.Show} {...overlay}>Click me</Button>
      <Backdrop as={[Portal, Overlay.Hide]} {...overlay} />
      <Overlay as={Portal} {...overlay}>Overlay</Overlay>
    </Block>
  )}
</Overlay.Container>
```