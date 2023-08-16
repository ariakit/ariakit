import "./style.css";
import { useState } from "react";
import { Checkbox, useCheckboxStore } from "@ariakit/react";

export default function Example() {
  const [hasStore, setHasStore] = useState(true);
  const [value, setValue] = useState(false);
  const [value1, setValue2] = useState(true);
  const store = useCheckboxStore({ value: value1 });
  const checked = useCheckboxStore({
    // defaultValue: true,
    value,
    setValue,
    store: hasStore ? store : undefined,
  });

  console.log(store.useState());

  return (
    <div>
      <button onClick={() => setHasStore(!hasStore)}>Toggle</button>
      <label className="label">
        <Checkbox className="checkbox" store={checked} /> I have read and agree
        to the terms and conditions
      </label>
    </div>
  );
}
