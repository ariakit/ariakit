`Popover` is a component that displays floating content next to a `controller` component.

```jsx
import { InlineBlock, Button } from "reakit";

<InlineBlock>
  <Button id="button">Button</Button>
  <Popover controller="button" placement="right" visible>
    Popover
  </Popover>
</InlineBlock>
```

If you don't pass the `controller` prop, which can be either a `string` or the element itself, it'll automatically use the parent element.

```jsx
import { Button } from "reakit";

<Button>
  Button
  <Popover placement="right" visible>
    Popover
  </Popover>
</Button>
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
      <Popover fade slide expand placement="bottom" {...popover}>
        <Popover.Arrow />
        Click outside to hide
      </Popover>
    </InlineBlock>
  )}
</Popover.Container>
```
