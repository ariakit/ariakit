import { Button } from "@ariakit/ui/components/button.ariakit.react";
import type { TooltipProps } from "@ariakit/ui/components/tooltip.ariakit.react";
import { Tooltip } from "@ariakit/ui/components/tooltip.ariakit.react";

type Side = "top" | "right" | "bottom" | "left";

// The buttons sit around the center, each next to the side of its tooltip.
const sides: Record<Side, string> = {
  top: "col-start-2 row-start-1",
  right: "col-start-3 row-start-2",
  bottom: "col-start-2 row-start-3",
  left: "col-start-1 row-start-2",
};

function SideButton({ side }: { side: Side }) {
  const label = `${side[0]?.toUpperCase()}${side.slice(1)}`;
  const placement: TooltipProps["placement"] = side;
  return (
    // Near an edge of the viewport, the tooltip flips to the other side.
    <Tooltip text={`On the ${side}`} placement={placement} arrow>
      <Button $kind="bevel" className={`${sides[side]} w-24`}>
        {label}
      </Button>
    </Tooltip>
  );
}

export default function Example() {
  return (
    <div className="grid grid-cols-3 grid-rows-3 place-items-center gap-3">
      <SideButton side="top" />
      <SideButton side="right" />
      <SideButton side="bottom" />
      <SideButton side="left" />
    </div>
  );
}
