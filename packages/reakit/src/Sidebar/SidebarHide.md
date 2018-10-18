```jsx
import { Block, Sidebar } from "reakit";

<Sidebar.Container initialState={{ visible: true }}>
  {({ visible, hide }) => (
    <Block>
      <Sidebar.Hide hide={hide}>Hide</Sidebar.Hide>
      <Sidebar visible={visible}>Sidebar</Sidebar>
    </Block>
  )}
</Sidebar.Container>
```
