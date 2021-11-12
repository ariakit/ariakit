import {
  Playground,
  PlaygroundClient,
  PlaygroundEditor,
  usePlaygroundState,
} from "ariakit-playground";

const defaultValues = {
  "index.tsx": `import { Button } from "ariakit/button";
import { css } from "@emotion/css";

const style = css\`
  color: red;
\`;

export default function Example() {
  return <Button className={style}>Hello World</Button>;
}
`,
};

export default function PlaygroundExample() {
  const playground = usePlaygroundState({ defaultValues });
  return (
    <Playground state={playground}>
      <PlaygroundClient />
      <PlaygroundEditor file="index.tsx" />
    </Playground>
  );
}
