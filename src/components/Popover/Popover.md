`Popover` is a component that shows itself briefly, then goes away. Tooltips, error messages and graphical tutorials come to mind as examples. The parent must have `position` set to something other than `static`, such as `relative`. By default it renders as a `<div>`.

```jsx
import { InlineBlock } from "reakit";

<InlineBlock relative>
  <Popover visible>
    Popover
  </Popover>
</InlineBlock>
```

Adding a Backdrop allows the Popover to hide if the user clicks outside.

```jsx
import { Block, Popover } from "reakit";

<Popover.Container>
  {popover => (
    <InlineBlock relative>
      <Backdrop background="transparent" as={Popover.Hide} {...popover} />
      <Button as={Popover.Toggle} {...popover}>
        Toggle
      </Button>
      <Popover expand placement="right-start" {...popover}>
        Click outside to hide
      </Popover>
      <Popover expand placement="bottom-end" {...popover}>
        Click outside to hide
      </Popover>
      <Popover fade expand placement="top" {...popover}>
        <Popover.Arrow />
        Click outside to hide
      </Popover>
    </InlineBlock>
  )}
</Popover.Container>
```
