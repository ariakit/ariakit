import { Button } from "ariakit/button";
import { VisuallyHidden } from "ariakit/visually-hidden";
import { undo } from "./icons";
import "./style.css";

export default function Example() {
  return (
    <Button className="button">
      {undo}
      <VisuallyHidden>Undo</VisuallyHidden>
    </Button>
  );
}
