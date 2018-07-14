```jsx
import { Block } from "reakit";

<Overlay.Container>
  {overlay => (
    <Block>
      <Overlay.Toggle {...overlay}>Toggle</Overlay.Toggle>
      <Overlay.Slide {...overlay}>Overlay</Overlay.Slide>
    </Block>
  )}
</Overlay.Container>
```
