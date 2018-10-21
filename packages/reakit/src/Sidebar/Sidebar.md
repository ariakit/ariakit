By default, `Sidebar` is a fixed [Overlay](../Overlay/Overlay.md) that appears on the left side of the screen.

```jsx
import { Block, Button, Backdrop } from "reakit";

<Sidebar.Container>
  {sidebar => (
    <Block>
      <Button use={Sidebar.Show} {...sidebar}>
        Open sidebar
      </Button>
      <Backdrop fade use={Sidebar.Hide} {...sidebar} />
      <Sidebar slide {...sidebar}>Sidebar</Sidebar>
    </Block>
  )}
</Sidebar.Container>
```

You can change its position with the `align` prop:

```jsx
import { Block, Button, Backdrop } from "reakit";

<Sidebar.Container>
  {sidebar => (
    <Block>
      <Button use={Sidebar.Show} {...sidebar}>
        Open right sidebar
      </Button>
      <Backdrop fade use={Sidebar.Hide} {...sidebar} />
      <Sidebar slide align="right" {...sidebar}>Sidebar</Sidebar>
    </Block>
  )}
</Sidebar.Container>
```

This is usually combined with [Portal](../Portal/Portal.md):

```jsx
import { Block, Button, Backdrop, Portal } from "reakit";

<Sidebar.Container>
  {sidebar => (
    <Block>
      <Button use={Sidebar.Show} {...sidebar}>
        Open sidebar
      </Button>
      <Backdrop use={[Portal, Sidebar.Hide]} {...sidebar} />
      <Sidebar use={Portal} {...sidebar}>Sidebar</Sidebar>
    </Block>
  )}
</Sidebar.Container>
```

You can also put it inside another wrapper component tweaking its `position` and `height` css properties:

```jsx
import { Block, Button, Backdrop } from "reakit";

<Sidebar.Container>
  {sidebar => (
    <Block relative overflow="hidden">
      <Button use={Sidebar.Show} {...sidebar}>
        Open sidebar
      </Button>
      <Backdrop absolute fade use={Sidebar.Hide} {...sidebar} />
      <Sidebar absolute height="100%" slide {...sidebar}>
        Sidebar
      </Sidebar>
    </Block>
  )}
</Sidebar.Container>
```