import * as Ariakit from "@ariakit/react";
import "./style.css";

export default function Example() {
  const tooltip = Ariakit.useTooltipStore({ placement: "bottom-end" });
  return (
    <>
      <Ariakit.TooltipAnchor
        as={Ariakit.Button}
        store={tooltip}
        className="button"
      >
        Hover or focus on me
      </Ariakit.TooltipAnchor>
      <Ariakit.Tooltip store={tooltip} className="tooltip">
        Tooltip
      </Ariakit.Tooltip>
    </>
  );
}
