```jsx
import { Block, Button } from "reakit";

<Sidebar.Container>
  {({ visible, show, hide, toggle }) => (
    <Block>
      <Button onClick={show}>Show</Button>
      <Sidebar visible={visible}>
        <Button onClick={hide}>Hide</Button>
      </Sidebar>
    </Block>
  )}
</Sidebar.Container>
```
