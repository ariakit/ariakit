import { Focusable } from "ariakit/focusable";
import "./style.css";

export default function Example() {
  return (
    <Focusable as="button" className="button">
      Button
    </Focusable>
  );
}
