import { Separator } from "@ariakit/react";

export default function Example() {
  return (
    <div className="ak-layer ak-layer-lighten-6 ak-frame ak-frame-container/4 grid gap-2 shadow">
      Item
      <Separator orientation="horizontal" className="ak-layer" />
      Item
    </div>
  );
}
