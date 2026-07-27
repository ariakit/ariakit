import * as Ariakit from "@ariakit/react";
import { lazy, Suspense, useState } from "react";

const LazyButton = lazy(() => import("./lazy-button.tsx"));

export default function Example() {
  const [rendered, setRendered] = useState(true);

  return (
    <>
      <button onClick={() => setRendered((value) => !value)}>
        Toggle portal
      </button>
      {rendered && <Ariakit.Portal>Detached portal content</Ariakit.Portal>}
      <Suspense fallback="Loading lazy portal">
        <Ariakit.Portal>
          <LazyButton />
        </Ariakit.Portal>
      </Suspense>
    </>
  );
}
