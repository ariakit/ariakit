import * as Ariakit from "@ariakit/react";
import { SelectPopover } from "../_select-shared.tsx";

export default function Example() {
  return (
    <Ariakit.SelectProvider defaultValue="Apple">
      <Ariakit.SelectLabel>Favorite fruit</Ariakit.SelectLabel>
      <Ariakit.Select />
      <SelectPopover />
    </Ariakit.SelectProvider>
  );
}
