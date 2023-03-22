import { Button, VisuallyHidden } from "@ariakit/react";
import { undo } from "./icons.js";
import "./style.css";

export default function Example() {
  return (
    <Button className="button">
      {undo}
      <VisuallyHidden>Undo</VisuallyHidden>
    </Button>
  );
}
