import * as Ariakit from "@ariakit/react";
import "./style.css";

export default function Example() {
  const tooltip = Ariakit.useTooltipStore({ timeout: 0 });
  return (
    <>
      <Ariakit.TooltipAnchor
        as={Ariakit.Button}
        store={tooltip}
        className="button"
      >
        Hover or focus on me
      </Ariakit.TooltipAnchor>
      <Ariakit.Tooltip store={tooltip} preserveTabOrder className="tooltip">
        Tooltip
      </Ariakit.Tooltip>
    </>
  );
}
