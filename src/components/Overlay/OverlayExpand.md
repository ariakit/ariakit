```jsx
import { Block } from "reakit";

<Overlay.Container>
  {overlay => (
    <Block>
      <Overlay.Toggle {...overlay}>Toggle</Overlay.Toggle>
      <Overlay.Expand {...overlay}>Overlay</Overlay.Expand>
    </Block>
  )}
</Overlay.Container>
```
