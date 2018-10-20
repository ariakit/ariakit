```jsx
import { InlineBlock, Popover } from "reakit";

<Popover.Container>
  {({ visible, show }) => (
    <InlineBlock relative>
      <Popover.Show show={show}>Show</Popover.Show>
      <Popover visible={visible}>Popover</Popover>
    </InlineBlock>
  )}
</Popover.Container>
```
