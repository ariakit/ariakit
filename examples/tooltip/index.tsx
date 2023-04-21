import * as Ariakit from "@ariakit/react";
import "./style.css";

export default function Example() {
  const tooltip = Ariakit.useTooltipStore();
  return (
    <>
      <Ariakit.TooltipAnchor
        store={tooltip}
        as="button"
        className="button secondary"
      >
        Hover or focus on me
      </Ariakit.TooltipAnchor>
      <Ariakit.Tooltip store={tooltip} className="tooltip">
        Tooltip
      </Ariakit.Tooltip>
    </>
  );
}
