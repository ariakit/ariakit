import * as Ariakit from "@ariakit/react";
import { useEffect, useRef, useState } from "react";

export default function Example() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [portalContainer, setPortalContainer] = useState<HTMLElement | null>(
    null,
  );

  useEffect(() => {
    const onFullscreenChange = () => {
      // TODO: Remove this workaround once
      // https://github.com/ariakit/ariakit/issues/865 is fixed.
      setPortalContainer(document.fullscreenElement as HTMLElement | null);
    };
    document.addEventListener("fullscreenchange", onFullscreenChange);
    return () => {
      document.removeEventListener("fullscreenchange", onFullscreenChange);
    };
  }, []);

  const enterFullscreen = () => {
    void containerRef.current?.requestFullscreen();
  };

  const exitFullscreen = () => {
    void document.exitFullscreen();
  };

  return (
    <Ariakit.PortalContext.Provider value={portalContainer}>
      <div
        ref={containerRef}
        style={{ padding: 20, background: "white", color: "black" }}
      >
        <button type="button" onClick={enterFullscreen}>
          Enter fullscreen
        </button>
        <button type="button" onClick={exitFullscreen}>
          Exit fullscreen
        </button>
        <Ariakit.TooltipProvider>
          <Ariakit.TooltipAnchor render={<button type="button" />}>
            Hover me
          </Ariakit.TooltipAnchor>
          <Ariakit.Tooltip>Tooltip content</Ariakit.Tooltip>
        </Ariakit.TooltipProvider>
      </div>
    </Ariakit.PortalContext.Provider>
  );
}
