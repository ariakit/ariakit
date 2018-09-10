```jsx
import { Block } from "reakit";

<Sidebar.Container>
  {({ visible, toggle }) => (
    <Block>
      <Sidebar.Toggle toggle={toggle}>Toggle</Sidebar.Toggle>
      <Sidebar visible={visible}>Sidebar</Sidebar>
    </Block>
  )}
</Sidebar.Container>
```
