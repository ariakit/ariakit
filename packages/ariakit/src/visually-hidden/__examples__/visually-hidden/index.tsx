import { VisuallyHidden } from "ariakit/visually-hidden";

export default function Example() {
  return (
    <>
      <p>Inspect the DOM below me to see the hidden element</p>

      <VisuallyHidden>You should not see me</VisuallyHidden>
    </>
  );
}
