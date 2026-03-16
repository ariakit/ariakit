import { Command } from "@ariakit/react";
import "./style.css";

export default function Example() {
  return (
    <div>
      <p>Notice that you cannot trigger the alert with the space key.</p>
      <Command
        className="button"
        clickOnSpace={false}
        onClick={() => alert("Accessible button clicked")}
        render={<div />}
      >
        Accessible button
      </Command>
    </div>
  );
}
