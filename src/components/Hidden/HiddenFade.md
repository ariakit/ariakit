```jsx
import { Block } from "reakit";

<Hidden.Container>
  {hidden => (
    <Block>
      <Hidden.Toggle {...hidden}>Toggle</Hidden.Toggle>
      <Hidden.Fade {...hidden}>Hidden</Hidden.Fade>
    </Block>
  )}
</Hidden.Container>
```