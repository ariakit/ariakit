import "./style.css";
import { useState } from "react";
import { Checkbox, useCheckboxStore } from "@ariakit/react";

export default function Example() {
  const [allChecked, setAllChecked] = useState(true);
  const checkbox1 = useCheckboxStore({
    value: allChecked,
    setValue: setAllChecked,
  });
  const checkbox2 = useCheckboxStore({
    store: allChecked ? checkbox1 : undefined,
  });
  return (
    <div>
      <label className="label">
        <Checkbox store={checkbox1} className="checkbox" />
        Checkbox 1
      </label>
      <label className="label">
        <Checkbox store={checkbox2} className="checkbox" />
        Checkbox 2
      </label>
    </div>
  );
}
