import { PlaygroundCode } from "ariakit-playground";
import theme from "ariakit-playground/themes/vscode-dark";
import "./style.css";

const value = `function Greeting({ name }) {
  return <h1>Hello, {name}!</h1>;
}

export default function App() {
  return (
    <div>
      <Greeting name="Divyesh" />
      <Greeting name="Sarah" />
      <Greeting name="Taylor" />
    </div>
  );
}
`;

const arrowDown = (
  <svg
    display="block"
    fill="none"
    stroke="currentColor"
    strokeLinecap="round"
    strokeLinejoin="round"
    strokeWidth="1.5pt"
    viewBox="0 0 16 16"
    height="1em"
    width="1em"
  >
    <polyline points="4,6 8,10 12,6"></polyline>
  </svg>
);

const arrowUp = (
  <svg
    display="block"
    fill="none"
    stroke="currentColor"
    strokeLinecap="round"
    strokeLinejoin="round"
    strokeWidth="1.5pt"
    viewBox="0 0 16 16"
    height="1em"
    width="1em"
  >
    <polyline points="4,10 8,6 12,10"></polyline>
  </svg>
);

export default function Example() {
  return (
    <div className="playground-code-wrapper">
      <PlaygroundCode
        className={`${theme} playground-code`}
        value={value}
        language="jsx"
        maxHeight={200}
        disclosureProps={{
          className: "playground-code-disclosure",
          children: (props) => (
            <button {...props}>
              <div>
                {props["aria-expanded"] ? "Collapse code" : "Expand code"}
              </div>
              {props["aria-expanded"] ? arrowUp : arrowDown}
            </button>
          ),
        }}
      />
    </div>
  );
}
