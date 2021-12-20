import { Checkbox, useCheckboxState } from "ariakit/checkbox";
import { Group, GroupLabel } from "ariakit/group";
import "./style.css";

export default function Example() {
  const checkbox = useCheckboxState({ defaultValue: [] });
  return (
    <Group className="group">
      <GroupLabel className="group-label">Your favorite fruits</GroupLabel>
      <label className="label">
        <Checkbox className="checkbox" state={checkbox} value="apple" /> Apple
      </label>
      <label className="label">
        <Checkbox className="checkbox" state={checkbox} value="orange" /> Orange
      </label>
      <label className="label">
        <Checkbox className="checkbox" state={checkbox} value="mango" /> Mango
      </label>
    </Group>
  );
}
