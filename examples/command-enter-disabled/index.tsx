import { Command } from "@ariakit/react";
import "./style.css";

export default function Example() {
  return (
    <div>
      <p>Notice that you cannot trigger the alert with the enter key.</p>
      <Command
        as="div"
        className="button"
        onClick={() => alert("Accessible button clicked")}
        clickOnEnter={false}
      >
        Accessible button
      </Command>
    </div>
  );
}
