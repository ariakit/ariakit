import * as Ariakit from "@ariakit/react";
import { useRef } from "react";

export default function Example() {
  const containerRef = useRef<HTMLDivElement>(null);

  const enterFullscreen = () => {
    void containerRef.current?.requestFullscreen();
  };

  const exitFullscreen = () => {
    void document.exitFullscreen();
  };

  return (
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
  );
}
