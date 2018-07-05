It displays a tooltip when the parent element is hovered or receives focus. By default it renders as a `<div>`.

```jsx
import { Button } from "reakit";

<Button>
  Hover me
  <Tooltip>Tooltip</Tooltip>
</Button>
```

Multiple Tooltips are possible:

```jsx
import { Button } from "reakit";

<Button margin="50px 80px">
  Hover me
  <Tooltip pos="top"><Tooltip.Arrow pos="bottom" />Tooltip</Tooltip>
  <Tooltip pos="right"><Tooltip.Arrow pos="left" />Tooltip</Tooltip>
  <Tooltip pos="bottom"><Tooltip.Arrow pos="top" />Tooltip</Tooltip>
  <Tooltip pos="left"><Tooltip.Arrow pos="right" />Tooltip</Tooltip>
</Button>
```
