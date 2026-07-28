import { Button, VisuallyHidden } from "@ariakit/react";

export default function Example() {
  return (
    <Button>
      <span aria-hidden>↶</span>
      <VisuallyHidden>Undo</VisuallyHidden>
    </Button>
  );
}
