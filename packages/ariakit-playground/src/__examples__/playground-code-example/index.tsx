import { PlaygroundCode } from "ariakit-playground";
import { playgroundCodeStyle } from "ariakit-playground/playground-style";

const value = `import { PlaygroundCode } from "ariakit-playground";
import { playgroundCodeStyle } from "ariakit-playground/playground-style";

const value = \`export default function Example() {
  return <div>Hello World</div>;
}
\`;

export default function PlaygroundCodeExample() {
  return (
    <PlaygroundCode
      className={playgroundCodeStyle}
      value={value}
      language="jsx"
    />
  );
}
`;

export default function PlaygroundCodeExample() {
  return (
    <PlaygroundCode
      className={playgroundCodeStyle}
      value={value}
      language="jsx"
      maxHeight={300}
    />
  );
}
