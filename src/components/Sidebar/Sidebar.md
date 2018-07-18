```jsx
import { Block, Button, Backdrop } from "reakit";

<Sidebar.Container>
  {sidebar => (
    <Block>
      <Button as={Sidebar.Show} {...sidebar}>Open left sidebar</Button>
      <Backdrop fade as={Sidebar.Hide} {...sidebar} />
      <Sidebar slide {...sidebar}>Sidebar</Sidebar>
    </Block>
  )}
</Sidebar.Container>
```

```jsx
import { Block, Button, Backdrop } from "reakit";

<Sidebar.Container>
  {sidebar => (
    <Block>
      <Button as={Sidebar.Show} {...sidebar}>Open right sidebar</Button>
      <Backdrop fade as={Sidebar.Hide} {...sidebar} />
      <Sidebar slide align="right" {...sidebar}>Sidebar</Sidebar>
    </Block>
  )}
</Sidebar.Container>
```