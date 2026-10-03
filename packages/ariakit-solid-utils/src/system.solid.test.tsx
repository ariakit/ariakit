// @vitest-environment jsdom
import { q } from "@ariakit/test";
import { render } from "@solidjs/web";
import type { JSX } from "@solidjs/web";
import { createContext, createSignal, useContext } from "solid-js";
import { expect, onTestFinished, test } from "vitest";
import { createInstance } from "./index.ts";
import type { RenderProp, WrapInstance } from "./index.ts";

const Context = createContext<() => string>(() => "Unwrapped");

function ContextValue() {
  const value = useContext(Context);
  return <span>{value()}</span>;
}

function mount(content: () => JSX.Element) {
  const container = document.createElement("div");
  document.body.appendChild(container);
  const dispose = render(content, container);
  onTestFinished(() => {
    dispose();
    container.remove();
  });
}

test.each([false, true])(
  "adding, changing, and removing wrappers updates context (render callback: %s)",
  async (customRender) => {
    const [wrapper, setWrapper] = createSignal<WrapInstance>();
    const wrapFirst: WrapInstance = (content) => (
      <Context value={() => "First"}>{content()}</Context>
    );
    const wrapSecond: WrapInstance = (content) => (
      <Context value={() => "Second"}>{content()}</Context>
    );
    mount(() =>
      createInstance("div", {
        role: "status",
        get children() {
          return <ContextValue />;
        },
        render: customRender
          ? (props) => <section role={props.role}>{props.children}</section>
          : undefined,
        get wrapInstance() {
          return wrapper();
        },
      }),
    );

    await expect.poll(() => q.status().textContent).toBe("Unwrapped");
    setWrapper(() => wrapFirst);
    await expect.poll(() => q.status().textContent).toBe("First");
    setWrapper(() => wrapSecond);
    await expect.poll(() => q.status().textContent).toBe("Second");
    setWrapper(undefined);
    await expect.poll(() => q.status().textContent).toBe("Unwrapped");
  },
);

test("renderer changes and removal keep the current wrapper context", async () => {
  const [renderer, setRenderer] = createSignal<RenderProp<"div">>();
  const [value, setValue] = createSignal("First");
  const renderSection: RenderProp<"div"> = (props) => (
    <section role={props.role}>{props.children}</section>
  );
  const renderArticle: RenderProp<"div"> = (props) => (
    <article role={props.role}>{props.children}</article>
  );
  mount(() =>
    createInstance("div", {
      role: "status",
      get children() {
        return <ContextValue />;
      },
      get render() {
        return renderer();
      },
      wrapInstance: (content) => <Context value={value}>{content()}</Context>,
    }),
  );

  await expect.poll(() => q.status().textContent).toBe("First");
  setRenderer(() => renderSection);
  await expect.poll(() => q.status().tagName).toBe("SECTION");
  expect(q.status().textContent).toBe("First");
  setValue("Second");
  await expect.poll(() => q.status().textContent).toBe("Second");
  setRenderer(() => renderArticle);
  await expect.poll(() => q.status().tagName).toBe("ARTICLE");
  expect(q.status().textContent).toBe("Second");
  setRenderer(undefined);
  await expect.poll(() => q.status().tagName).toBe("DIV");
  expect(q.status().textContent).toBe("Second");
});
