import {
  Playground,
  PlaygroundClient,
  PlaygroundEditor,
  usePlaygroundState,
} from "ariakit-playground";
import "./style.css";

const defaultValues = {
  "index.js": `import { Button } from "ariakit/button";

export default function Example() {
  return <Button>Button</Button>;
}
`,
};

export default function Example() {
  const playground = usePlaygroundState({ defaultValues });
  return (
    <Playground state={playground} className="playground">
      <PlaygroundEditor file="index.js" className="editor" />
      <PlaygroundClient className="preview" />
    </Playground>
  );
}
