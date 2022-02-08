import { Checkbox } from "ariakit/checkbox";
import { VisuallyHidden } from "ariakit/visually-hidden";
import "./style.css";

export default function Example() {
  return (
    <label className="label">
      <Checkbox className="checkbox" as="button">
        <VisuallyHidden>checkbox</VisuallyHidden>
      </Checkbox>
      I have read and agree to the terms and conditions
    </label>
  );
}
