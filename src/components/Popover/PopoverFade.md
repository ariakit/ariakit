```jsx
import { InlineBlock } from "reakit";

<Popover.Container>
  {popover => (
    <InlineBlock relative>
      <Popover.Toggle {...popover}>Toggle</Popover.Toggle>
      <Popover.Fade {...popover}>Popover</Popover.Fade>
    </InlineBlock>
  )}
</Popover.Container>
```
