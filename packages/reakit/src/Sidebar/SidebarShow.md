```jsx
import { Block } from "reakit";

<Sidebar.Container>
  {({ visible, show }) => (
    <Block>
      <Sidebar.Show show={show}>Show</Sidebar.Show>
      <Sidebar visible={visible}>Sidebar</Sidebar>
    </Block>
  )}
</Sidebar.Container>
```
