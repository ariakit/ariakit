import { Command } from "@ariakit/react";
import "./style.css";

export default function Example() {
  return (
    <Command
      role="button"
      className="button"
      onClick={() => alert("Accessible button clicked")}
      render={<div />}
    >
      Button
    </Command>
  );
}
