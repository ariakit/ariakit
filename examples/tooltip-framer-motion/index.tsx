import { TooltipAnchor } from "./tooltip-anchor.jsx";
import "./style.css";

export default function Example() {
  const href = "https://ariakit.org/examples/tooltip-framer-motion";
  return (
    <TooltipAnchor
      description={href}
      className="link"
      render={(props) => <a href={href} {...props} />}
    >
      Tooltip with Framer Motion
    </TooltipAnchor>
  );
}
