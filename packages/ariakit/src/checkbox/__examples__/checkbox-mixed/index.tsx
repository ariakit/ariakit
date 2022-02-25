import { useEffect } from "react";
import { Checkbox, useCheckboxState } from "ariakit/checkbox";
import "./style.css";

function useTreeState({ values }: { values: string[] }) {
  const group = useCheckboxState<boolean | "mixed">({ defaultValue: true });
  const items = useCheckboxState({ defaultValue: values });

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
    if ((items.value as string[]).length === values.length) {
      group.setValue(true);
    } else if ((items.value as string[]).length) {
      group.setValue("mixed");
    } else {
      group.setValue(false);
    }
  }, [items.value]);

  return { group, items };
}

export default function Example() {
  const values = ["apple", "orange", "watermelon"];
  const { group, items } = useTreeState({ values });

  return (
    <ul>
      <li>
        <label>
          <Checkbox state={group} /> Fruits
        </label>
      </li>
      <ul className="items">
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
