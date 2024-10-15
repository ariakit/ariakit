import * as Ariakit from "@ariakit/react";
import { ComboboxItem } from "@ariakit/react-core/combobox/combobox-item-offscreen";
import { useRef } from "react";
import "./style.css";

export default function Example() {
  const ref = useRef<HTMLDivElement>(null);
  return (
    <Ariakit.ComboboxProvider focusLoop={false}>
      <Ariakit.ComboboxLabel className="label">
        Your favorite fruit
      </Ariakit.ComboboxLabel>
      <Ariakit.Combobox placeholder="e.g., Apple" className="combobox" />
      <Ariakit.ComboboxPopover
        ref={ref}
        gutter={4}
        sameWidth
        unmountOnHide
        className="popover"
      >
        {Array.from({ length: 1000 }).map((_, index) => (
          <ComboboxItem
            key={index}
            className="combobox-item"
            value={`Item ${index}`}
          />
        ))}
      </Ariakit.ComboboxPopover>
    </Ariakit.ComboboxProvider>
  );
}
