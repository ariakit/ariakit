`Popover` is a component that shows itself briefly, then goes away. Tooltips, error messages and graphical tutorials come to mind as examples. The parent must have `position` set to something other than `static`, such as `relative`. By default it renders as a `<div>`.

```jsx
import { InlineBlock } from "reakit";

/* <InlineBlock relative width={100} height={100}>
  <Popover visible>
    Popover
  </Popover>
</InlineBlock>*/
```

Adding a Backdrop allows the Popover to hide if the user clicks outside.

```jsx
import { Block, Popover } from "reakit";

<Popover.Container>
  {popover => (
    <InlineBlock relative>
      <Backdrop background="transparent" as={Popover.Hide} {...popover} />
      <Button id="lol" as={Popover.Toggle} {...popover}>
        Toggle
      </Button>
      <Popover fade expand placement="top-start" {...popover}>
        <Popover.Arrow />
        Click outside to hide
      </Popover>
    </InlineBlock>
  )}
</Popover.Container>
```
