import { Command } from "ariakit/command";
import "./style.css";

export default function Example() {
  return (
    <Command
      as="div"
      role="button"
      className="button"
      onClick={() => alert("Accessible button clicked")}
    >
      Button
    </Command>
  );
}
