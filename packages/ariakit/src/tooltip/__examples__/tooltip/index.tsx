import { Tooltip, TooltipAnchor, useTooltipState } from "ariakit/tooltip";

export default function Example() {
  const tooltip = useTooltipState();
  return (
    <>
      <TooltipAnchor state={tooltip} as="button">
        Hover on me!
      </TooltipAnchor>
      <Tooltip state={tooltip}>You hovered on a button</Tooltip>
    </>
  );
}
