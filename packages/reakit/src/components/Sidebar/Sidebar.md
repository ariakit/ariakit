By default, `Sidebar` is a fixed [Overlay](/components/overlay) that appears on the left side of the screen.

```jsx
import { Block, Button, Backdrop } from "reakit";

<Sidebar.Container>
  {sidebar => (
    <Block>
      <Button as={Sidebar.Show} {...sidebar}>
        Open sidebar
      </Button>
      <Backdrop fade as={Sidebar.Hide} {...sidebar} />
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
      <Button as={Sidebar.Show} {...sidebar}>
        Open right sidebar
      </Button>
      <Backdrop fade as={Sidebar.Hide} {...sidebar} />
      <Sidebar slide align="right" {...sidebar}>Sidebar</Sidebar>
    </Block>
  )}
</Sidebar.Container>
```

This is usually combined with [Portal](/components/portal):

```jsx
import { Block, Button, Backdrop, Portal } from "reakit";

<Sidebar.Container>
  {sidebar => (
    <Block>
      <Button as={Sidebar.Show} {...sidebar}>
        Open sidebar
      </Button>
      <Backdrop as={[Portal, Sidebar.Hide]} {...sidebar} />
      <Sidebar as={Portal} {...sidebar}>Sidebar</Sidebar>
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
      <Button as={Sidebar.Show} {...sidebar}>
        Open sidebar
      </Button>
      <Backdrop absolute fade as={Sidebar.Hide} {...sidebar} />
      <Sidebar absolute height="100%" slide {...sidebar}>
        Sidebar
      </Sidebar>
    </Block>
  )}
</Sidebar.Container>
```