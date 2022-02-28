import { Checkbox, useCheckboxState } from "ariakit/checkbox";
import { Group, GroupLabel } from "ariakit/group";

import "./style.css";

export default function Example() {
  const checkbox = useCheckboxState({ defaultValue: [] });

  return (
    <Group className="group">
      <GroupLabel className="group-label">Your favorite fruits</GroupLabel>
      {checkbox.value.length > 0 ? <p>{checkbox.value.join(", ")}</p> : <br />}
      <label className="label">
        <Checkbox state={checkbox} value="apple" className="checkbox" /> Apple
      </label>
      <label className="label">
        <Checkbox state={checkbox} value="orange" className="checkbox" /> Orange
      </label>
      <label className="label">
        <Checkbox state={checkbox} value="mango" className="checkbox" /> Mango
      </label>
    </Group>
  );
}
