import * as Ariakit from "@ariakit/react";

import "./style.css";

export default function Example() {
  const composite = Ariakit.useCompositeStore();
  return (
    <Ariakit.Composite store={composite} className="composite">
      <Ariakit.CompositeItem className="composite-item">
        🍎 Apple
      </Ariakit.CompositeItem>
      <Ariakit.CompositeItem className="composite-item">
        🍇 Grape
      </Ariakit.CompositeItem>
      <Ariakit.CompositeItem className="composite-item">
        🍊 Orange
      </Ariakit.CompositeItem>
    </Ariakit.Composite>
  );
}
