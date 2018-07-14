```jsx
import { Block } from "reakit";

<Hidden.Container>
  {hidden => (
    <Block>
      <Hidden.Toggle {...hidden}>Toggle</Hidden.Toggle>
      <Hidden.Expand background="white" {...hidden}>
        Hidden
      </Hidden.Expand>
    </Block>
  )}
</Hidden.Container>
```