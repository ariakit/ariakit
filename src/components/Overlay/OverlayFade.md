```jsx
import { Block } from "reakit";

<Overlay.Container>
  {overlay => (
    <Block>
      <Overlay.Toggle {...overlay}>Toggle</Overlay.Toggle>
      <Overlay.Fade to="top" {...overlay}>Overlay</Overlay.Fade>
    </Block>
  )}
</Overlay.Container>
```
