import * as Ariakit from "@ariakit/react";
import "./style.css";

export default function Example() {
  const tooltip = Ariakit.useTooltipStore({ timeout: 2000 });
  return (
    <>
      <Ariakit.TooltipAnchor
        as={Ariakit.Button}
        store={tooltip}
        className="button"
      >
        Hover or focus on me and wait for 2 seconds
      </Ariakit.TooltipAnchor>
      <Ariakit.Tooltip store={tooltip} className="tooltip">
        Tooltip
      </Ariakit.Tooltip>
    </>
  );
}
