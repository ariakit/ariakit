import { Separator } from "@ariakit/react";
import { Frame } from "@ariakit/ui/components/frame.ariakit.react";
import { separator } from "@ariakit/ui/styles/separator";

export default function Example() {
  return (
    <Frame $rounded="xl" $p={4} $lighten className="grid gap-2 shadow">
      Item
      <Separator
        orientation="horizontal"
        {...separator.jsx({ $line: "solid", $gap: 0 })}
      />
      Item
    </Frame>
  );
}
