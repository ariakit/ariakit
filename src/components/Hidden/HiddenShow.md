```jsx
import { Block } from "reakit";

<Hidden.Container>
  {({ visible, show }) => (
    <Block>
      <Hidden.Show show={show}>Show</Hidden.Show>
      <Hidden visible={visible}>Hidden</Hidden>
    </Block>
  )}
</Hidden.Container>
```
