import { Separator } from "@ariakit/react";
import { frame } from "@ariakit/ui/styles/frame.ts";
import { separator } from "@ariakit/ui/styles/separator.ts";

export default function Example() {
  return (
    <div
      {...frame.jsx({
        $rounded: "xl",
        $p: 4,
        $lighten: true,
        className: "grid gap-2 shadow",
      })}
    >
      Item
      <Separator
        orientation="horizontal"
        {...separator.jsx({ $line: "solid", $gap: 0 })}
      />
      Item
    </div>
  );
}
