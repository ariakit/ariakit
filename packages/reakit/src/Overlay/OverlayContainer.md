```jsx
import { Block, Button, Overlay } from "reakit";

<Overlay.Container>
  {({ visible, show, hide, toggle }) => (
    <Block>
      <Button onClick={show}>Show</Button>
      <Overlay visible={visible}>
        <Button onClick={hide}>Hide</Button>
      </Overlay>
    </Block>
  )}
</Overlay.Container>
```
