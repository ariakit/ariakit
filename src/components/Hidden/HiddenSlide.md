```jsx
import { Block } from "reakit";

<Hidden.Container>
  {hidden => (
    <Block>
      <Hidden.Toggle {...hidden}>Toggle</Hidden.Toggle>
      <Hidden.Slide {...hidden}>Hidden</Hidden.Slide>
    </Block>
  )}
</Hidden.Container>
```