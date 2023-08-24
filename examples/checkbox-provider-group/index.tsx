import "./style.css";
import { Checkbox, Group, GroupLabel } from "@ariakit/react";
import { CheckboxProvider } from "@ariakit/react-core/checkbox/checkbox-provider";

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
