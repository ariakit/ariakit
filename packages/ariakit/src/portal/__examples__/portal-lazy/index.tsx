import { Suspense, lazy } from "react";
import { Portal } from "ariakit/portal";
import "./style.css";

const Button = lazy(() =>
  import("ariakit/button").then((mod) => ({ default: mod.Button }))
);

export default function Example() {
  return (
    <Suspense fallback="Loading">
      The button is rendered at the end of the document.
      <Portal>
        <Button className="button">Button</Button>
      </Portal>
    </Suspense>
  );
}
