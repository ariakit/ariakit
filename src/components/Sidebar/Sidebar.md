```jsx
const { Block, Button, Backdrop } = require('reakit');

<Sidebar.Container>
  {sidebar => (
    <Block>
      <Button as={Sidebar.Show} {...sidebar}>Open left sidebar</Button>
      <Backdrop as={Sidebar.Hide} {...sidebar} />
      <Sidebar {...sidebar}>Sidebar</Sidebar>
    </Block>
  )}
</Sidebar.Container>
```

```jsx
const { Block, Button, Backdrop } = require('reakit');

<Sidebar.Container>
  {sidebar => (
    <Block>
      <Button as={Sidebar.Show} {...sidebar}>Open right sidebar</Button>
      <Backdrop as={Sidebar.Hide} {...sidebar} />
      <Sidebar align="right" {...sidebar}>Sidebar</Sidebar>
    </Block>
  )}
</Sidebar.Container>
```