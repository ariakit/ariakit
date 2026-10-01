import { render } from "@ariakit/test/react";
import { createContext, useContext, useRef, useState } from "react";
import { testSystem } from "./__system-contract.ts";
import type { SystemScenario } from "./__system-contract.ts";
import { createElement as createSystemElement } from "./system.tsx";
import type { RenderProp, WrapElement } from "./types.ts";

const Context = createContext("Unwrapped");
const renderButton: RenderProp = (props) => <button {...props} />;
const renderDiv: RenderProp = (props) => <div {...props} />;
const renderSection: RenderProp = (props) => <section {...props} />;
const wrapInContext: WrapElement = (element) => (
  <Context.Provider value="Wrapped">{element}</Context.Provider>
);

function ContextValue() {
  return <span>{useContext(Context)}</span>;
}

function WrappedElement() {
  return createSystemElement("div", {
    role: "status",
    "aria-label": "Context",
    children: <ContextValue />,
    wrapElement: wrapInContext,
  });
}

function Fixture({ scenario }: { scenario: SystemScenario }) {
  const [count, setCount] = useState(0);
  const [show, setShow] = useState(true);
  const ref = useRef<HTMLButtonElement>(null);
  if (scenario === "replacement") {
    return (
      <>
        <button onClick={() => setShow(false)}>Switch element</button>
        {createSystemElement("div", {
          role: "status",
          "aria-label": "View",
          children: "Swappable",
          render: show ? renderDiv : renderSection,
        })}
      </>
    );
  }
  if (scenario === "native") {
    return (
      <>
        <button onClick={() => setCount(count + 1)}>Increment</button>
        {createSystemElement("div", {
          role: "status",
          "aria-label": "Counter",
          title: count === 0 ? "Initial" : undefined,
          children: count,
        })}
      </>
    );
  }
  if (scenario === "render") {
    return (
      <>
        {createSystemElement("button", {
          ref,
          "data-count": count,
          onClick: () => setCount(count + 1),
          children: `Count: ${count}`,
          render: renderButton,
        })}
        <button onClick={() => ref.current?.focus()}>Focus counter</button>
      </>
    );
  }
  return (
    <>
      <button onClick={() => setShow(!show)}>{show ? "Hide" : "Show"}</button>
      {show && <WrappedElement />}
    </>
  );
}

testSystem(async (scenario) => {
  const { unmount } = await render(<Fixture scenario={scenario} />);
  return unmount;
});
