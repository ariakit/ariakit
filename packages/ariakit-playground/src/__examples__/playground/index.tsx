import {
  Playground,
  PlaygroundEditor,
  PlaygroundPreview,
  usePlaygroundState,
} from "ariakit-playground";
import theme from "ariakit-playground/themes/default";
import "./style.css";

const defaultValues = {
  "index.js": `export default function Example() {
  return <div>Hello World</div>;
}
`,
};

export default function Example() {
  const playground = usePlaygroundState({ defaultValues });
  return (
    <Playground state={playground} className="playground">
      <PlaygroundEditor className={`${theme} editor`} file="index.js" />
      <PlaygroundPreview className="preview" />
    </Playground>
  );
}
