import { click, q } from "@ariakit/test";
import { act, createElement } from "react";
import { hydrateRoot } from "react-dom/client";
import { renderToString } from "react-dom/server";
import { expect, test, vi } from "vitest";
import { TypeFixture } from "./index.react.tsx";

test("declares native button types before refs run", () => {
  expect(q.tab("Default tab")).toHaveAttribute("type", "button");
  expect(q.tab("Submit tab")).toHaveAttribute("type", "submit");
  expect(q.tab("Reset tab")).toHaveAttribute("type", "reset");
  expect(q.tab("Button tab")).toHaveAttribute("type", "button");
  expect(q.tab("Div tab")).not.toHaveAttribute("type");
  expect(q.tab("Hook tab")).not.toHaveAttribute("type");
  expect(q.button("Input command")).toHaveAttribute("type", "submit");
  expect(q.button("Default command")).toHaveAttribute("type", "button");
  expect(q.button("Default button")).toHaveAttribute("type", "button");
  expect(q.button("Submit button")).toHaveAttribute("type", "submit");
  expect(q.button("Reset button")).toHaveAttribute("type", "reset");
  expect(q.text("Div button")).not.toHaveAttribute("type");
  expect(q.button("Toolbar item")).toHaveAttribute("type", "button");
  expect(q.status("Default button ref type")).toHaveTextContent("button");
  expect(q.status("Default command ref type")).toHaveTextContent("button");
  expect(q.status("Default tab ref type")).toHaveTextContent("button");
  expect(q.status("Toolbar item ref type")).toHaveTextContent("button");
});

test("preserves custom element semantics", () => {
  expect(q.text("Focusable div")).toHaveAttribute("tabindex", "0");
  expect(q.link("Disabled anchor")).toHaveAttribute("tabindex", "-1");
  expect(q.link("Disabled anchor")).not.toHaveAttribute("disabled");
  expect(q.button("Disabled button")).toHaveAttribute("disabled");

  const nestedMenuButton = document.querySelector("#nested-menu-button");
  expect(nestedMenuButton).toHaveProperty("tagName", "DIV");
  expect(nestedMenuButton).not.toHaveAttribute("type");
});

test("updates semantics when rendered elements change", async () => {
  await click(q.button("Swap rendered elements"));

  expect(q.text("Dynamic enabled")).toHaveAttribute("tabindex", "0");
  expect(q.button("Dynamic disabled")).toHaveAttribute("disabled");
  expect(q.text("Dynamic from button")).not.toHaveAttribute("type");
  expect(q.button("Dynamic from div")).toHaveAttribute("type", "button");
});

test("updates custom focusability", async () => {
  const focusable = q.text("Focusable div");
  expect(focusable).toHaveAttribute("tabindex", "0");

  await click(q.button("Toggle focusable"));
  expect(focusable).not.toHaveAttribute("tabindex");

  await click(q.button("Toggle focusable"));
  expect(focusable).toHaveAttribute("tabindex", "0");
});

test("server markup and hydration use the same native button type", async () => {
  const scope = globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean };
  const previousActEnvironment = scope.IS_REACT_ACT_ENVIRONMENT;
  scope.IS_REACT_ACT_ENVIRONMENT = true;
  const element = createElement(TypeFixture, {});
  const container = document.createElement("div");
  const consoleError = vi.spyOn(console, "error").mockImplementation(() => {});
  let root: ReturnType<typeof hydrateRoot> | undefined;
  try {
    container.innerHTML = renderToString(element);
    const unexpectedServerErrors = consoleError.mock.calls.filter(
      ([message]) =>
        !String(message).includes("useLayoutEffect does nothing on the server"),
    );
    expect(unexpectedServerErrors).toEqual([]);
    consoleError.mockClear();
    document.body.appendChild(container);

    expect(container.querySelector("#default-tab")).toHaveAttribute(
      "type",
      "button",
    );
    expect(container.querySelector("#submit-tab")).toHaveAttribute(
      "type",
      "submit",
    );
    expect(container.querySelector("#div-tab")).not.toHaveAttribute("type");
    expect(
      container.querySelector('input[value="Input command"]'),
    ).toHaveAttribute("type", "submit");
    expect(container.querySelector("#default-command")).toHaveAttribute(
      "type",
      "button",
    );
    expect(container.querySelector("#default-button")).toHaveAttribute(
      "type",
      "button",
    );
    expect(container.querySelector("#submit-button")).toHaveAttribute(
      "type",
      "submit",
    );
    expect(container.querySelector("#reset-button")).toHaveAttribute(
      "type",
      "reset",
    );
    expect(container.querySelector("#div-button")).not.toHaveAttribute("type");
    expect(container.querySelector("#toolbar-item")).toHaveAttribute(
      "type",
      "button",
    );

    await act(async () => {
      root = hydrateRoot(container, element);
    });
    expect(consoleError).not.toHaveBeenCalled();

    expect(container.querySelector("#default-tab")).toHaveAttribute(
      "type",
      "button",
    );
    expect(container.querySelector("#submit-tab")).toHaveAttribute(
      "type",
      "submit",
    );
    expect(container.querySelector("#div-tab")).not.toHaveAttribute("type");
    expect(
      container.querySelector('input[value="Input command"]'),
    ).toHaveAttribute("type", "submit");
    expect(container.querySelector("#default-command")).toHaveAttribute(
      "type",
      "button",
    );
    expect(container.querySelector("#default-button")).toHaveAttribute(
      "type",
      "button",
    );
    expect(container.querySelector("#submit-button")).toHaveAttribute(
      "type",
      "submit",
    );
    expect(container.querySelector("#reset-button")).toHaveAttribute(
      "type",
      "reset",
    );
    expect(container.querySelector("#div-button")).not.toHaveAttribute("type");
    expect(container.querySelector("#toolbar-item")).toHaveAttribute(
      "type",
      "button",
    );
  } finally {
    consoleError.mockRestore();
    if (root) {
      await act(async () => root?.unmount());
    }
    container.remove();
    scope.IS_REACT_ACT_ENVIRONMENT = previousActEnvironment;
  }
});
