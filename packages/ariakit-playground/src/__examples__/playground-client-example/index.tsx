import {
  Playground,
  PlaygroundClient,
  PlaygroundEditor,
  usePlaygroundState,
} from "ariakit-playground";

const defaultValues = {
  "index.tsx": `import { Button } from "ariakit/button";
import { css } from "@emotion/css";

import "./style.css";

const style = css\`
  color: red;
\`;

export default function Example() {
  return <Button className={style}>Hello World</Button>;
}
`,
  "style.css": `
button {
  background-color: black;
}
  `,
};

export default function PlaygroundExample() {
  const playground = usePlaygroundState({ defaultValues });
  return (
    <Playground state={playground}>
      <PlaygroundClient />
      <PlaygroundEditor file="index.tsx" />
      <PlaygroundEditor file="style.css" />
    </Playground>
  );
}
