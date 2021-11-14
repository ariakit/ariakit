import { PlaygroundCode } from "ariakit-playground";
import theme from "ariakit-playground/themes/vscode-dark";

const value = `import { PlaygroundCode } from "ariakit-playground";
import theme from "ariakit-playground/themes/vscode-dark";

const value = \`export default function Example() {
  return <div>Hello World</div>;
}
\`;

export default function PlaygroundCodeExample() {
  return <PlaygroundCode className={theme} value={value} language="jsx" />;
}
`;

export default function PlaygroundCodeExample() {
  return <PlaygroundCode className={theme} value={value} language="jsx" />;
}
