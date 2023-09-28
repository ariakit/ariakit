import "./style.css";
import { Button, Group } from "@ariakit/react";

export default function Example() {
  return (
    <Group className="group">
      <Button className="button">Bold</Button>
      <Button className="button">Italic</Button>
      <Button className="button">Underline</Button>
    </Group>
  );
}
