import * as Ariakit from "@ariakit/react";
import { StrictMode, useState } from "react";

export default function Example() {
  const [activeTooltip, setActiveTooltip] = useState<"one" | "two" | null>(
    null,
  );

  const openFirstTooltip = () => setActiveTooltip("one");
  const openSecondTooltip = () => setActiveTooltip("two");

  return (
    <StrictMode>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 40,
          padding: 40,
        }}
      >
        <button type="button" onClick={openFirstTooltip}>
          Open first tooltip
        </button>
        <button type="button" onClick={openSecondTooltip}>
          Open second tooltip
        </button>
        {/* TODO: Remove this one-at-a-time workaround once https://github.com/ariakit/ariakit/issues/4894 is fixed. */}
        <div style={{ display: "flex", gap: 40 }}>
          <Ariakit.TooltipProvider open={activeTooltip === "one"}>
            <Ariakit.TooltipAnchor>one</Ariakit.TooltipAnchor>
            <Ariakit.Tooltip>HELLO!</Ariakit.Tooltip>
          </Ariakit.TooltipProvider>
          <Ariakit.TooltipProvider open={activeTooltip === "two"}>
            <Ariakit.TooltipAnchor>two</Ariakit.TooltipAnchor>
            <Ariakit.Tooltip>HELLO 222!</Ariakit.Tooltip>
          </Ariakit.TooltipProvider>
        </div>
      </div>
    </StrictMode>
  );
}
