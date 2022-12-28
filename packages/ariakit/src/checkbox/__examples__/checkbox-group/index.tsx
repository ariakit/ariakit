import { Checkbox, useCheckboxState } from "ariakit/checkbox";
import { Group, GroupLabel } from "ariakit/group";
import "./style.css";

export default function Example() {
  const checkbox = useCheckboxState({ defaultValue: [] });
  return (
    <Group className="wrapper">
      <GroupLabel>Your favorite fruits</GroupLabel>
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
