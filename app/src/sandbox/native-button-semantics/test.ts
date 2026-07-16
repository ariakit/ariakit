import { click, focus, press, q } from "@ariakit/test";
import { act, createElement } from "react";
import { hydrateRoot } from "react-dom/client";
import { renderToString } from "react-dom/server";
import { expect, test, vi } from "vitest";
import { TypeFixture } from "./index.react.tsx";

function expectSharedButtonTypes(query: ReturnType<typeof q.within>) {
  expect(query.tab("Default tab")).toHaveAttribute("type", "button");
  expect(query.tab("Submit tab")).toHaveAttribute("type", "submit");
  expect(query.tab("Reset tab")).toHaveAttribute("type", "reset");
  expect(query.tab("Div tab")).not.toHaveAttribute("type");
  expect(query.tab("Hook tab")).not.toHaveAttribute("type");
  expect(query.button("Input command")).toHaveAttribute("type", "submit");
  expect(query.button("Default command")).toHaveAttribute("type", "button");
  expect(query.button("Default button")).toHaveAttribute("type", "button");
  expect(query.button("Submit button")).toHaveAttribute("type", "submit");
  expect(query.button("Reset button")).toHaveAttribute("type", "reset");
  expect(query.button("Toolbar item")).toHaveAttribute("type", "button");
  expect(query.button("Root menu")).toHaveAttribute("type", "button");
  const nestedMenuButton = query.menuitem("Nested menu");
  expect(nestedMenuButton).toHaveProperty("tagName", "DIV");
  expect(nestedMenuButton).not.toHaveAttribute("type");
}

function expectServerButtonTypes(query: ReturnType<typeof q.within>) {
  expectSharedButtonTypes(query);
  expect(query.text("Div button")).not.toHaveAttribute("type");
}

function expectNativeButtonTypes(query: ReturnType<typeof q.within>) {
  expectSharedButtonTypes(query);
  expect(query.tab("Button tab")).toHaveAttribute("type", "button");
  expect(query.button("Div button")).not.toHaveAttribute("type");
}

test("declares native button types before refs run", () => {
  expectNativeButtonTypes(q);
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
});

test("updates custom focusability", async () => {
  const focusable = q.text("Focusable div");
  expect(focusable).toHaveAttribute("tabindex", "0");

  await click(q.button("Toggle focusable"));
  expect(focusable).not.toHaveAttribute("tabindex");

  await click(q.button("Toggle focusable"));
  expect(focusable).toHaveAttribute("tabindex", "0");
});

test("clears submit focus visibility when focusable is disabled", async () => {
  const button = q.button("Submit focus target");
  await focus(button);
  await press("a");
  expect(button).toHaveAttribute("data-focus-visible", "true");

  await press("f");
  expect(button).not.toHaveAttribute("data-focus-visible");
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

    const containerQuery = q.within(container);
    expectServerButtonTypes(containerQuery);

    await act(async () => {
      root = hydrateRoot(container, element);
    });
    expect(consoleError).not.toHaveBeenCalled();

    expectNativeButtonTypes(containerQuery);
  } finally {
    consoleError.mockRestore();
    if (root) {
      await act(async () => root?.unmount());
    }
    container.remove();
    scope.IS_REACT_ACT_ENVIRONMENT = previousActEnvironment;
  }
});
