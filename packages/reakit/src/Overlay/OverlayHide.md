```jsx
import { Block, Overlay } from "reakit";

<Overlay.Container initialState={{ visible: true }}>
  {({ visible, hide }) => (
    <Block>
      <Overlay.Hide hide={hide}>Hide</Overlay.Hide>
      <Overlay visible={visible}>Overlay</Overlay>
    </Block>
  )}
</Overlay.Container>
```
