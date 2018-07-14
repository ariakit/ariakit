```jsx
import { Block } from "reakit";

<Sidebar.Container>
  {sidebar => (
    <Block>
      <Sidebar.Toggle {...sidebar}>Toggle</Sidebar.Toggle>
      <Sidebar.Fade to="right" {...sidebar}>Sidebar</Sidebar.Fade>
    </Block>
  )}
</Sidebar.Container>
```
