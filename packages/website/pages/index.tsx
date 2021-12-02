import React from "react";
import {
  Playground,
  PlaygroundPreview,
  usePlaygroundState,
} from "ariakit-playground";

const value = `import { useId } from "react";

export default function Example() {
  const id = useId();
  return <button id={id}>Button</button>;
}
`;

export default function Home() {
  const playground = usePlaygroundState({
    defaultValues: { "index.js": value },
  });
  return (
    <div>
      <Playground state={playground}>
        <PlaygroundPreview />
      </Playground>
    </div>
  );
}
