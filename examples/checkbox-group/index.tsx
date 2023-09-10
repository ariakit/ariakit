import "./style.css";
import { Checkbox, CheckboxProvider, Group, GroupLabel } from "@ariakit/react";

export default function Example() {
  return (
    <CheckboxProvider defaultValue={[]}>
      <Group className="wrapper">
        <GroupLabel>Your favorite fruits</GroupLabel>
        <label className="label">
          <Checkbox value="apple" className="checkbox" /> Apple
        </label>
        <label className="label">
          <Checkbox value="orange" className="checkbox" /> Orange
        </label>
        <label className="label">
          <Checkbox value="mango" className="checkbox" /> Mango
        </label>
      </Group>
    </CheckboxProvider>
  );
}
