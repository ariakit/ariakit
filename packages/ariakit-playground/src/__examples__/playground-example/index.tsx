import {
  Playground,
  PlaygroundEditor,
  PlaygroundPreview,
  usePlaygroundState,
} from "ariakit-playground";
import { playgroundEditorStyle } from "ariakit-playground/playground-style";

const defaultValues = {
  "index.js": `export default function Example() {
  return <div>Hello World</div>;
}
`,
};

export default function PlaygroundExample() {
  const playground = usePlaygroundState({ defaultValues });
  return (
    <Playground state={playground}>
      <PlaygroundPreview state={playground} file="index.js" />
      <PlaygroundEditor className={playgroundEditorStyle} file="index.js" />
    </Playground>
  );
}
