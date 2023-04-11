import { Command } from "@ariakit/react";
import "./style.css";

export default function Example() {
  return (
    <div>
      <p>Notice that you cannot trigger the alert with the space key.</p>
      <Command
        as="div"
        className="button"
        onClick={() => alert("Accessible button clicked")}
        clickOnSpace={false}
      >
        Accessible button
      </Command>
    </div>
  );
}
