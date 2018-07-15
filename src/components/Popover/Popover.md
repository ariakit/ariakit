`Popover` is a component that shows itself briefly, then goes away. Tooltips, error messages and graphical tutorials come to mind as examples. The parent must have `position` set to something other than `static`, such as `relative`. By default it renders as a `<div>`.

```jsx
import { InlineBlock } from "reakit";

<InlineBlock relative width={100} marginBottom={70}>
  <Popover visible>
    <Popover.Arrow />
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
      <Popover fade expand slide {...popover}>
        <Popover.Arrow />
        Click outside to hide
      </Popover>
    </InlineBlock>
  )}
</Popover.Container>
```
