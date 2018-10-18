```jsx
import { Block, Hidden } from "reakit";

<Hidden.Container initialState={{ visible: true }}>
  {({ visible, hide }) => (
    <Block>
      <Hidden.Hide hide={hide}>Hide</Hidden.Hide>
      <Hidden visible={visible}>Hidden</Hidden>
    </Block>
  )}
</Hidden.Container>
```
