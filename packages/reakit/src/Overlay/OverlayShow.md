```jsx
import { Block } from "reakit";

<Overlay.Container>
  {({ visible, show }) => (
    <Block>
      <Overlay.Show show={show}>Show</Overlay.Show>
      <Overlay visible={visible}>Overlay</Overlay>
    </Block>
  )}
</Overlay.Container>
```
