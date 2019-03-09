---
path: /docs/tooltip
redirect_from:
  - /components/tooltip
---

# Tooltip

```jsx
import {
  Tooltip,
  TooltipArrow,
  TooltipReference,
  useTooltipState,
  Button
} from "reakit";

function Example() {
  const tooltip = useTooltipState();
  return (
    <div style={{ padding: 100 }}>
      <TooltipReference as={Button} {...tooltip}>
        Reference
      </TooltipReference>
      <Tooltip {...tooltip}>
        <TooltipArrow {...tooltip} />
        tooltip
      </Tooltip>
    </div>
  );
}
```
