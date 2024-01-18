import "./style.css";
import * as Ariakit from "@ariakit/react";

const icon = (
  <svg
    stroke="currentColor"
    fill="currentColor"
    strokeWidth="0"
    viewBox="0 0 16 16"
    height="1em"
    width="1em"
  >
    <path d="M11.061 7.573c0.586-0.696 0.939-1.594 0.939-2.573 0-2.206-1.794-4-4-4h-5v14h6c2.206 0 4-1.794 4-4 0-1.452-0.778-2.726-1.939-3.427zM6 3h1.586c0.874 0 1.586 0.897 1.586 2s-0.711 2-1.586 2h-1.586v-4zM8.484 13h-2.484v-4h2.484c0.913 0 1.656 0.897 1.656 2s-0.743 2-1.656 2z"></path>
  </svg>
);

export default function Example() {
  return (
    <Ariakit.TooltipProvider>
      <Ariakit.TooltipAnchor className="button" render={<Ariakit.Button />}>
        <Ariakit.VisuallyHidden>Bold</Ariakit.VisuallyHidden>
        {icon}
      </Ariakit.TooltipAnchor>
      <Ariakit.Tooltip className="tooltip">Bold</Ariakit.Tooltip>
    </Ariakit.TooltipProvider>
  );
}
