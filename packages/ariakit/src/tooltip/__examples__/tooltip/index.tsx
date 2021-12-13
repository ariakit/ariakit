import { Tooltip, useTooltipState, TooltipAnchor } from "ariakit/tooltip";

export default function Example() {
  const tooltip = useTooltipState();
  return (
    <div>
      <TooltipAnchor state={tooltip}>
        Hover on me
      </TooltipAnchor>
      <Tooltip state={tooltip}>This is a tooltip example</Tooltip>
    </div>
  );
}
