import { Portal } from "ariakit/portal";
import "./style.css";

export default function Example() {
  return (
    <div className="wrapper">
      Portal is rendered at the bottom left of the page
      <Portal>I am portal and I am detached at the bottom of the page.</Portal>
    </div>
  );
}
