import { Button } from "@ariakit/react";
import "./style.css";

export default function Example() {
  return (
    <Button className="button" render={<a href="#" />}>
      Button
    </Button>
  );
}
