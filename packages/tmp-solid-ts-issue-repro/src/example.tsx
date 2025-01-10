import { createTooltipStore } from "@ariakit/core/tooltip/tooltip-store";
import { Dynamic } from "solid-js/web";

createTooltipStore();

function App() {
  return (
    <div>
      <Dynamic component="a" />
    </div>
  );
}

<App />;
