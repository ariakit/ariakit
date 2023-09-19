import "./style.css";
import { useState } from "react";
import {
  Select,
  SelectItem,
  SelectLabel,
  SelectPopover,
  SelectProvider,
} from "@ariakit/react";

export default function Example() {
  const [mounted, setMounted] = useState(false);
  return (
    <div className="wrapper">
      <SelectProvider animated defaultValue="Apple" setMounted={setMounted}>
        <SelectLabel className="label">Favorite fruit</SelectLabel>
        <Select className="button" />
        {mounted && (
          <SelectPopover portal gutter={4} sameWidth className="popover">
            <SelectItem className="select-item" value="Apple" />
            <SelectItem className="select-item" value="Banana" />
            <SelectItem className="select-item" value="Grape" />
            <SelectItem className="select-item" value="Orange" />
          </SelectPopover>
        )}
      </SelectProvider>
    </div>
  );
}
