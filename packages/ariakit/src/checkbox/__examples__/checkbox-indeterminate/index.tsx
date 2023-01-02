import { useEffect } from "react";
import { Checkbox, useCheckboxState } from "ariakit/checkbox";

import "./style.css";

function useTreeState({ values }: { values: Array<string | number> }) {
  const group = useCheckboxState();
  const items = useCheckboxState<Array<string | number>>({ defaultValue: [] });

  // updates items when group is toggled
  useEffect(() => {
    if (group.value === true) {
      items.setValue(values);
    } else if (group.value === false) {
      items.setValue([]);
    }
  }, [group.value]);

  // updates group when items is toggled
  useEffect(() => {
    if (items.value.length === values.length) {
      group.setValue(true);
    } else if (items.value.length) {
      group.setValue("mixed");
    } else {
      group.setValue(false);
    }
  }, [items.value]);

  return { group, items };
}

export default function Example() {
  const values = ["Apple", "Orange", "Mango"];
  const { group, items } = useTreeState({ values });
  return (
    <ul>
      <li>
        <label>
          <Checkbox
            state={group}
            {...(group.value === "mixed"
              ? {
                  checked: "mixed",
                }
              : {})}
          />
          Fruits
        </label>
      </li>
      <ul>
        {values.map((value, i) => (
          <li key={i}>
            <label>
              <Checkbox state={items} value={value} /> {value}
            </label>
          </li>
        ))}
      </ul>
    </ul>
  );
}
