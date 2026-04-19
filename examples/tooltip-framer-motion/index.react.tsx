import "./style.css";
import { TooltipAnchor } from "./tooltip-anchor.tsx";

export default function Example() {
  const href = "https://ariakit.com/examples/tooltip-framer-motion";
  return (
    <TooltipAnchor
      className="link"
      description={href}
      render={<a href={href} />}
    >
      Tooltip with Motion
    </TooltipAnchor>
  );
}
