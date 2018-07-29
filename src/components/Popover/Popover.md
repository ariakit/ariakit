`Popover` is a component that displays floating content relative to its parent component.

```jsx
import { InlineBlock, Button } from "reakit";

<InlineBlock relative>
  <Button>Button</Button>
  <Popover placement="right" visible>
    Popover
  </Popover>
</InlineBlock>
```

You can use [PopoverContainer](/components/popover/popovercontainer) in combination with [PopoverHide](/components/popover/popoverhide) and [PopoverToggle](/components/popover/popovertoggle) to easily create an animated popover:

```jsx
import { InlineBlock, Popover } from "reakit";

<Popover.Container>
  {popover => (
    <InlineBlock relative>
      <Backdrop background="transparent" as={Popover.Hide} {...popover} />
      <Button as={Popover.Toggle} {...popover}>
        Toggle
      </Button>
      <Popover fade slide expand {...popover}>
        <Popover.Arrow />
        Click outside to hide
      </Popover>
    </InlineBlock>
  )}
</Popover.Container>
```
