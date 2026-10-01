// @vitest-environment jsdom
import { render } from "@solidjs/web";
import { createContext, createSignal, Show, useContext } from "solid-js";
import { testSystem } from "../../ariakit-test/src/__system-tests.ts";
import type { SystemScenario } from "../../ariakit-test/src/__system-tests.ts";
import { createElement } from "./index.ts";
import type { RenderProp } from "./index.ts";

const renderDiv: RenderProp<"div"> = (props) => <div {...props} />;
const renderSection: RenderProp<"div"> = (props) => (
  <section role={props.role} aria-label={props["aria-label"]}>
    {props.children}
  </section>
);

const Context = createContext("Unwrapped");

function ContextValue() {
  return <span>{useContext(Context)}</span>;
}

function ReplacementFixture() {
  const [original, setOriginal] = createSignal(true);
  return (
    <>
      <button onClick={() => setOriginal(false)}>Switch element</button>
      {createElement("div", {
        role: "status",
        "aria-label": "View",
        children: "Swappable",
        get render() {
          return original() ? renderDiv : renderSection;
        },
      })}
    </>
  );
}

function NativeFixture() {
  const [count, setCount] = createSignal(0);
  return (
    <>
      <button onClick={() => setCount(count() + 1)}>Increment</button>
      {createElement("div", {
        role: "status",
        "aria-label": "Counter",
        get title() {
          return count() === 0 ? "Initial" : undefined;
        },
        get children() {
          return count();
        },
      })}
    </>
  );
}

function RenderFixture() {
  const [count, setCount] = createSignal(0);
  let ref: HTMLButtonElement | undefined;
  return (
    <>
      {createElement("button", {
        ref: (element) => {
          ref = element;
        },
        get "data-count"() {
          return count();
        },
        onClick: () => setCount(count() + 1),
        get children() {
          return `Count: ${count()}`;
        },
        render: (props) => <button {...props} />,
      })}
      <button onClick={() => ref?.focus()}>Focus counter</button>
    </>
  );
}

function WrapperFixture() {
  const [show, setShow] = createSignal(true);
  return (
    <>
      <button onClick={() => setShow(!show())}>
        {show() ? "Hide" : "Show"}
      </button>
      <Show when={show()}>
        {(_visible) =>
          createElement("div", {
            role: "status",
            "aria-label": "Context",
            get children() {
              return <ContextValue />;
            },
            wrapElement: (element) => (
              <Context value="Wrapped">{element()}</Context>
            ),
          })
        }
      </Show>
    </>
  );
}

const fixtures = {
  replacement: ReplacementFixture,
  native: NativeFixture,
  render: RenderFixture,
  wrapper: WrapperFixture,
} satisfies Record<SystemScenario, () => unknown>;

testSystem(async (scenario) => {
  const container = document.createElement("div");
  document.body.appendChild(container);
  const Fixture = fixtures[scenario];
  const dispose = render(() => <Fixture />, container);
  return () => {
    dispose();
    container.remove();
  };
});
