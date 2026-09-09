import { Layer } from "@ariakit/ui/components/layer.ariakit.react";

export default function Example() {
  return (
    <div className="grid gap-4">
      <Layer $layer="brand" $hue={0} className="rounded-lg p-6">
        Numeric zero
      </Layer>
      <Layer $layer="brand" $hue="0" className="rounded-lg p-6">
        String zero
      </Layer>
      <Layer $layer="brand" $hue={120} className="rounded-lg p-6">
        120 degrees
      </Layer>
    </div>
  );
}
