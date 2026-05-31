import * as Ariakit from "@ariakit/react";
import { useState } from "react";

export default function Example() {
  const [showNested, setShowNested] = useState(false);

  return (
    <Ariakit.HovercardProvider open>
      <Ariakit.HovercardAnchor>Parent anchor</Ariakit.HovercardAnchor>
      <Ariakit.Hovercard aria-label="Parent hovercard">
        <button type="button" onClick={() => setShowNested((show) => !show)}>
          Toggle nested
        </button>
        {showNested && (
          <Ariakit.HovercardProvider open>
            <Ariakit.HovercardAnchor>Nested anchor</Ariakit.HovercardAnchor>
            <Ariakit.Hovercard portal aria-label="Nested hovercard">
              Nested content
            </Ariakit.Hovercard>
          </Ariakit.HovercardProvider>
        )}
      </Ariakit.Hovercard>
    </Ariakit.HovercardProvider>
  );
}
