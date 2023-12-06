import "./style.css";
import { useState } from "react";
import * as Ariakit from "@ariakit/react";

export default function Example() {
  const [open, setOpen] = useState(true);
  return (
    <div className="wrapper">
      <Ariakit.SelectProvider
        open={open}
        setOpen={setOpen}
        defaultValue="Apple"
      >
        <Ariakit.SelectLabel className="label">
          Favorite fruit
        </Ariakit.SelectLabel>
        <Ariakit.Select className="button" />
        <Ariakit.SelectPopover
          gutter={4}
          sameWidth
          unmountOnHide
          className="popover"
        >
          <Ariakit.SelectItem className="select-item" value="Apple" />
          <Ariakit.SelectItem className="select-item" value="Banana" />
          <Ariakit.SelectItem className="select-item" value="Grape" />
          <Ariakit.SelectItem className="select-item" value="Orange" />
        </Ariakit.SelectPopover>
      </Ariakit.SelectProvider>
    </div>
  );
}
