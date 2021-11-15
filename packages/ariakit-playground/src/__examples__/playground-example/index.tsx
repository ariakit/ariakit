import {
  Playground,
  PlaygroundEditor,
  PlaygroundPreview,
  usePlaygroundState,
} from "ariakit-playground";
import "./style.css";

const defaultValues = {
  "index.js": `export default function Example() {
  return <div>Hello World</div>;
}
`,
};

export default function PlaygroundExample() {
  const playground = usePlaygroundState({ defaultValues });
  return (
    <Playground state={playground} className="playground">
      <PlaygroundEditor className="editor" file="index.js" />
      <PlaygroundPreview className="preview" />
    </Playground>
  );
}
