```jsx
import { Block } from "reakit";

<Overlay.Container>
  {({ visible, toggle }) => (
    <Block>
      <Overlay.Toggle toggle={toggle}>Toggle</Overlay.Toggle>
      <Overlay visible={visible}>Overlay</Overlay>
    </Block>
  )}
</Overlay.Container>
```
