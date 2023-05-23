import { Checkbox, Group, GroupLabel, useCheckboxStore } from "@ariakit/react";
import "./style.css";

export default function Example() {
  const checkbox = useCheckboxStore({ defaultValue: [] });
  return (
    <Group className="wrapper">
      <GroupLabel>Your favorite fruits</GroupLabel>
      <label className="label">
        <Checkbox store={checkbox} value="apple" className="checkbox" /> Apple
      </label>
      <label className="label">
        <Checkbox store={checkbox} value="orange" className="checkbox" /> Orange
      </label>
      <label className="label">
        <Checkbox store={checkbox} value="mango" className="checkbox" /> Mango
      </label>
    </Group>
  );
}
