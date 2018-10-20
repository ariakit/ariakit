```jsx
import { InlineBlock, Popover } from "reakit";

<Popover.Container initialState={{ visible: true }}>
  {({ visible, hide }) => (
    <InlineBlock relative>
      <Popover.Hide hide={hide}>Hide</Popover.Hide>
      <Popover visible={visible}>Popover</Popover>
    </InlineBlock>
  )}
</Popover.Container>
```
