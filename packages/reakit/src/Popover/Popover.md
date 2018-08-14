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

You can use [PopoverContainer](PopoverContainer.md) in combination with [PopoverHide](PopoverHide.md) and [PopoverToggle](PopoverToggle.md) to easily create an animated popover:

```jsx
import { InlineBlock, Popover } from "reakit";

<Popover.Container>
  {popover => (
    <InlineBlock relative>
      <Button as={Popover.Toggle} {...popover}>
        Toggle
      </Button>
      <Popover fade slide expand hideOnClickOutside {...popover}>
        <Popover.Arrow />
        Click outside to hide
      </Popover>
    </InlineBlock>
  )}
</Popover.Container>
```
