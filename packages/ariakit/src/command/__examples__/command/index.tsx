import { Command } from "ariakit/command";
import "./style.css";

export default function Example() {
  return (
    <Command
      as="div"
      className="button"
      onClick={() => alert("Accessible button clicked")}
    >
      Accessible button
    </Command>
  );
}
