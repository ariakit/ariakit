import * as Ariakit from "@ariakit/react";
import "./style.css";

export default function Example() {
  const tooltip = Ariakit.useTooltipStore();
  return (
    <>
      <Ariakit.TooltipAnchor
        as={Ariakit.Button}
        store={tooltip}
        className="button secondary"
      >
        Hover or focus on me
      </Ariakit.TooltipAnchor>
      <Ariakit.Tooltip portal={false} store={tooltip} className="tooltip">
        Tooltip
      </Ariakit.Tooltip>
    </>
  );
}
