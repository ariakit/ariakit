import { PlaygroundCode } from "ariakit-playground";

const value = `function Example() {
  return <div>Hello World</div>;
}
`;

export default function PlaygroundCodeExample() {
  return <PlaygroundCode value={value} language="jsx" />;
}
