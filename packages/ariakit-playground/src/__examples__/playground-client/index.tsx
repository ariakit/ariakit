import {
  Playground,
  PlaygroundClient,
  PlaygroundEditor,
  usePlaygroundStore,
} from "@ariakit/playground";
import "./style.css";

const defaultValues = {
  "index.js": `import { Button } from "ariakit/button";

export default function Example() {
  return <Button>Button</Button>;
}
`,
};

export default function Example() {
  const playground = usePlaygroundStore({ defaultValues });
  return (
    <Playground store={playground} className="playground">
      <PlaygroundEditor file="index.js" className="editor" />
      <PlaygroundClient className="preview" />
    </Playground>
  );
}
