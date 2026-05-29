import * as Ariakit from "@ariakit/react";
import { useRef, useState } from "react";

export default function Example() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [showSecond, setShowSecond] = useState(false);

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
      <button type="button" onClick={() => setShowSecond(true)}>
        Show second tooltip
      </button>
      <Ariakit.TooltipProvider>
        <Ariakit.TooltipAnchor render={<button type="button" />}>
          Hover me
        </Ariakit.TooltipAnchor>
        <Ariakit.Tooltip>Tooltip content</Ariakit.Tooltip>
      </Ariakit.TooltipProvider>
      {showSecond && (
        <Ariakit.TooltipProvider>
          <Ariakit.TooltipAnchor render={<button type="button" />}>
            Second anchor
          </Ariakit.TooltipAnchor>
          <Ariakit.Tooltip>Second tooltip</Ariakit.Tooltip>
        </Ariakit.TooltipProvider>
      )}
    </div>
  );
}
