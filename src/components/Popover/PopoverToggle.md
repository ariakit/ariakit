```jsx
import { InlineBlock } from "reakit";

<Popover.Container>
  {({ visible, toggle }) => (
    <InlineBlock relative>
      <Popover.Toggle toggle={toggle}>Toggle</Popover.Toggle>
      <Popover visible={visible}>Popover</Popover>
    </InlineBlock>
  )}
</Popover.Container>
```
