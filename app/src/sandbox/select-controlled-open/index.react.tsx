import * as Ariakit from "@ariakit/react";
import { useState } from "react";
import { SelectPopover } from "../_select-shared.tsx";

export default function Example() {
  const [open, setOpen] = useState(true);
  return (
    <Ariakit.SelectProvider open={open} setOpen={setOpen} defaultValue="Apple">
      <Ariakit.SelectLabel>Favorite fruit</Ariakit.SelectLabel>
      <Ariakit.Select />
      <SelectPopover />
    </Ariakit.SelectProvider>
  );
}
