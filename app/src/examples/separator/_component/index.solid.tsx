import { Separator } from "@ariakit/solid";
import { frame } from "@ariakit/ui/styles/frame";
import { separator } from "@ariakit/ui/styles/separator";

export default function Example() {
  return (
    <div
      {...frame.html({
        $rounded: "xl",
        $p: 4,
        $lighten: true,
        class: "grid gap-2 shadow",
      })}
    >
      Item
      <Separator
        orientation="horizontal"
        {...separator.html({ $line: "solid", $gap: 0 })}
      />
      Item
    </div>
  );
}
