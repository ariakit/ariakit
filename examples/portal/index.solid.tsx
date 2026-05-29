import { Portal } from "@ariakit/solid";
import "./style.css";

export default function Example() {
  return (
    <div class="wrapper">
      Portal is rendered at the bottom left of the page
      <Portal>I am portal and I am detached at the bottom of the page.</Portal>
    </div>
  );
}
