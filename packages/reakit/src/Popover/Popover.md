`Popover` is a component that displays floating content relative to its parent component.

You can change the visiblity of the popover in the example below by removing `visible`.

```jsx
import { InlineBlock, Button, Popover } from "reakit";

<InlineBlock relative>
  <Button>Button</Button>
  <Popover placement="right" visible>
    Popover
  </Popover>
</InlineBlock>
```

You can use [PopoverContainer](PopoverContainer.md) in combination with [PopoverHide](PopoverHide.md) and [PopoverToggle](PopoverToggle.md) to easily create an animated popover:

```jsx
import { InlineBlock, Button, Popover } from "reakit";

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
