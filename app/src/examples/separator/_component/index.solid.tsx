import { Separator } from "@ariakit/solid";
import { separator } from "@ariakit/ui/styles/separator.ts";

export default function Example() {
  return (
    <Separator
      orientation="horizontal"
      {...separator.html({ $line: "solid", $gap: 0 })}
    />
  );
}
