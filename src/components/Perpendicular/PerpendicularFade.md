```jsx
import { Hidden, InlineBlock } from "reakit";

<Hidden.Container>
  {hidden => (
    <InlineBlock relative>
      <Hidden.Toggle {...hidden}>Toggle</Hidden.Toggle>
      <Perpendicular.Fade to="bottom" pos="top" {...hidden}>Perpendicular</Perpendicular.Fade>
    </InlineBlock>
  )}
</Hidden.Container>
```
