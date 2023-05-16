import * as Ariakit from "@ariakit/react";
import "./style.css";

export default function Example() {
  const tooltip = Ariakit.useTooltipStore();
  return (
    <>
      <Ariakit.TooltipAnchor
        store={tooltip}
        as="a"
        href="https://ariakit.org/components/tooltip"
        className="link"
      >
        Tooltip
      </Ariakit.TooltipAnchor>
      <Ariakit.Tooltip store={tooltip} className="tooltip">
        https://ariakit.org/components/tooltip
      </Ariakit.Tooltip>
    </>
  );
}
