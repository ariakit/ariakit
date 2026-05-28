import * as Ariakit from "@ariakit/react";
import { StrictMode, useState } from "react";

export default function Example() {
  const [closeRequests, setCloseRequests] = useState(0);

  const setOpen = (open: boolean) => {
    if (open) return;
    setCloseRequests((count) => count + 1);
  };

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
        <div>Close requests: {closeRequests}</div>
        <div style={{ display: "flex", gap: 40 }}>
          <Ariakit.TooltipProvider open setOpen={setOpen}>
            <Ariakit.TooltipAnchor>one</Ariakit.TooltipAnchor>
            <Ariakit.Tooltip>HELLO!</Ariakit.Tooltip>
          </Ariakit.TooltipProvider>
          <Ariakit.TooltipProvider open setOpen={setOpen}>
            <Ariakit.TooltipAnchor>two</Ariakit.TooltipAnchor>
            <Ariakit.Tooltip>HELLO 222!</Ariakit.Tooltip>
          </Ariakit.TooltipProvider>
        </div>
      </div>
    </StrictMode>
  );
}
