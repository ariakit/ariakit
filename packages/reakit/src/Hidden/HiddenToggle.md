```jsx
import { Block } from "reakit";

<Hidden.Container>
  {({ visible, toggle }) => (
    <Block>
      <Hidden.Toggle toggle={toggle}>Toggle</Hidden.Toggle>
      <Hidden visible={visible}>Hidden</Hidden>
    </Block>
  )}
</Hidden.Container>
```
