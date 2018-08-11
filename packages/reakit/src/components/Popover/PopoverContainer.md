```jsx
import { InlineBlock, Button } from "reakit";

<Popover.Container>
  {({ visible, show, hide, toggle }) => (
    <InlineBlock relative>
      <Button onClick={show}>Show</Button>
      <Popover visible={visible}>
        <Button onClick={hide}>Hide</Button>
      </Popover>
    </InlineBlock>
  )}
</Popover.Container>
```
