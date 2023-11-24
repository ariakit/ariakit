import "./style.css";
import * as Ariakit from "@ariakit/react";

export default function Example() {
  const composite = Ariakit.useCompositeStore();
  return (
    <Ariakit.Composite store={composite} className="composite">
      <Ariakit.CompositeItem>🍎 Apple</Ariakit.CompositeItem>
      <Ariakit.CompositeItem>🍇 Grape</Ariakit.CompositeItem>
      <Ariakit.CompositeItem>🍊 Orange</Ariakit.CompositeItem>
    </Ariakit.Composite>
  );
}
