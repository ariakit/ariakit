import "./style.css";
import { Button, VisuallyHidden } from "@ariakit/react";
import { undo } from "./icons.jsx";

export default function Example() {
  return (
    <Button className="button">
      {undo}
      <VisuallyHidden>Undo</VisuallyHidden>
    </Button>
  );
}
