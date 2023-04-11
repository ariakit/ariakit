import * as Ariakit from "@ariakit/react";
import "./style.css";

export default function Example() {
  const checkbox = Ariakit.useCheckboxStore({ defaultValue: [] });
  return (
    <Ariakit.Group className="wrapper">
      <Ariakit.GroupLabel>Your favorite fruits</Ariakit.GroupLabel>
      <label className="label">
        <Ariakit.Checkbox store={checkbox} value="apple" className="checkbox" />{" "}
        Apple
      </label>
      <label className="label">
        <Ariakit.Checkbox
          store={checkbox}
          value="orange"
          className="checkbox"
        />{" "}
        Orange
      </label>
      <label className="label">
        <Ariakit.Checkbox store={checkbox} value="mango" className="checkbox" />{" "}
        Mango
      </label>
    </Ariakit.Group>
  );
}
