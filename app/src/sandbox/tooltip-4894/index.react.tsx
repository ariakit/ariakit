import * as Ariakit from "@ariakit/react";
import { StrictMode, useState } from "react";

export default function Example() {
  const [showForcedTooltips, setShowForcedTooltips] = useState(false);
  const [forcedCloseRequests, setForcedCloseRequests] = useState(0);
  const [managedTooltips, setManagedTooltips] = useState({
    one: false,
    two: false,
  });

  const setForcedOpen = (open: boolean) => {
    if (open) return;
    setForcedCloseRequests((count) => count + 1);
  };

  const setManagedOpen =
    (key: keyof typeof managedTooltips) => (open: boolean) => {
      setManagedTooltips((tooltips) => ({ ...tooltips, [key]: open }));
    };

  const openManagedTooltip = (key: keyof typeof managedTooltips) => () => {
    setManagedTooltips((tooltips) => ({ ...tooltips, [key]: true }));
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
        <div>Forced close requests: {forcedCloseRequests}</div>
        <button type="button" onClick={() => setShowForcedTooltips(true)}>
          Show forced tooltips
        </button>
        {showForcedTooltips && (
          <div style={{ display: "flex", gap: 40 }}>
            <Ariakit.TooltipProvider open setOpen={setForcedOpen}>
              <Ariakit.TooltipAnchor>forced one</Ariakit.TooltipAnchor>
              <Ariakit.Tooltip>FORCED ONE</Ariakit.Tooltip>
            </Ariakit.TooltipProvider>
            <Ariakit.TooltipProvider open setOpen={setForcedOpen}>
              <Ariakit.TooltipAnchor>forced two</Ariakit.TooltipAnchor>
              <Ariakit.Tooltip>FORCED TWO</Ariakit.Tooltip>
            </Ariakit.TooltipProvider>
            <Ariakit.TooltipProvider open setOpen={setForcedOpen}>
              <Ariakit.TooltipAnchor>forced three</Ariakit.TooltipAnchor>
              <Ariakit.Tooltip>FORCED THREE</Ariakit.Tooltip>
            </Ariakit.TooltipProvider>
          </div>
        )}
        <div style={{ display: "flex", gap: 8 }}>
          <button type="button" onClick={openManagedTooltip("one")}>
            Open managed one
          </button>
          <button type="button" onClick={openManagedTooltip("two")}>
            Open managed two
          </button>
        </div>
        <div style={{ display: "flex", gap: 40 }}>
          <Ariakit.TooltipProvider
            open={managedTooltips.one}
            setOpen={setManagedOpen("one")}
          >
            <Ariakit.TooltipAnchor>managed one</Ariakit.TooltipAnchor>
            <Ariakit.Tooltip>MANAGED ONE</Ariakit.Tooltip>
          </Ariakit.TooltipProvider>
          <Ariakit.TooltipProvider
            open={managedTooltips.two}
            setOpen={setManagedOpen("two")}
          >
            <Ariakit.TooltipAnchor>managed two</Ariakit.TooltipAnchor>
            <Ariakit.Tooltip>MANAGED TWO</Ariakit.Tooltip>
          </Ariakit.TooltipProvider>
        </div>
      </div>
    </StrictMode>
  );
}
