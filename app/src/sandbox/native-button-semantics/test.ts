import { click, focus, press, q } from "@ariakit/test";
import { act, createElement, Fragment } from "react";
import { hydrateRoot } from "react-dom/client";
import { renderToString } from "react-dom/server";
import { expect, test, vi } from "vitest";
import { CapabilityFixture, TypeFixture } from "./index.react.tsx";

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
  expect(query.link("Link button")).toHaveAttribute("href", "#button-link");
  expect(query.button("Toolbar item")).toHaveAttribute("type", "button");
  expect(query.button("Root menu")).toHaveAttribute("type", "button");
  const nestedMenuButton = query.menuitem("Nested menu");
  expect(nestedMenuButton).toHaveProperty("tagName", "DIV");
  expect(nestedMenuButton).not.toHaveAttribute("type");
}

function expectServerElementSemantics(query: ReturnType<typeof q.within>) {
  expectSharedButtonTypes(query);
  const divButton = query.text("Div button");
  expect(divButton).not.toHaveAttribute("type");

  const disabledAnchor = query.link("Disabled anchor");
  expect(disabledAnchor).toHaveAttribute("role", "link");
  expect(disabledAnchor).toHaveAttribute("tabindex", "-1");
  expect(disabledAnchor).not.toHaveAttribute("disabled");

  const accessibleAnchor = query.link("Disabled accessible anchor");
  expect(accessibleAnchor).toHaveAttribute("role", "link");
  expect(accessibleAnchor).toHaveAttribute("tabindex", "0");
  expect(accessibleAnchor).not.toHaveAttribute("disabled");
}

function expectNativeElementSemantics(query: ReturnType<typeof q.within>) {
  expectSharedButtonTypes(query);
  expect(query.tab("Button tab")).toHaveAttribute("type", "button");
  const divButton = query.button("Div button");
  expect(divButton).not.toHaveAttribute("type");
  expect(divButton).toHaveAttribute("role", "button");
  expect(divButton).toHaveAttribute("tabindex", "0");
}

test("declares native button types before refs run", () => {
  expectNativeElementSemantics(q);
  expect(q.status("Default button ref type")).toHaveTextContent("button");
  expect(q.status("Default command ref type")).toHaveTextContent("button");
  expect(q.status("Default tab ref type")).toHaveTextContent("button");
  expect(q.status("Toolbar item ref type")).toHaveTextContent("button");
});

test("preserves custom element semantics", () => {
  expect(q.text("Focusable div")).toHaveAttribute("tabindex", "0");
  expect(q.button("Disabled button")).toHaveAttribute("disabled");
});

// https://github.com/ariakit/ariakit/issues/7112
test("preserves disabled anchor semantics", () => {
  expect(q.link("Disabled anchor")).toHaveAttribute("tabindex", "-1");
  expect(q.link("Disabled anchor")).not.toHaveAttribute("disabled");
  expect(q.link("Disabled accessible anchor")).toHaveAttribute("tabindex", "0");
  expect(q.link("Disabled accessible anchor")).toHaveAttribute(
    "aria-disabled",
    "true",
  );
  expect(q.link("Disabled accessible anchor")).toHaveAttribute("role", "link");
  expect(q.link("Disabled accessible anchor")).not.toHaveAttribute("disabled");
  expect(q.link("Disabled link button")).toHaveAttribute("role", "link");
  expect(q.link("Disabled link button")).toHaveAttribute(
    "href",
    "#disabled-link-button",
  );
  expect(q.link("Disabled link button")).toHaveAttribute(
    "aria-disabled",
    "true",
  );
  expect(q.link("Disabled link button")).toHaveAttribute("tabindex", "-1");
  expect(q.link("Disabled link button")).not.toHaveAttribute("disabled");
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

// https://github.com/ariakit/ariakit/issues/7112
test("server markup and hydration preserve native element semantics", async () => {
  const scope = globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean };
  const previousActEnvironment = scope.IS_REACT_ACT_ENVIRONMENT;
  scope.IS_REACT_ACT_ENVIRONMENT = true;
  const element = createElement(
    Fragment,
    {},
    createElement(TypeFixture, {}),
    createElement(CapabilityFixture, {}),
  );
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
    expectServerElementSemantics(containerQuery);

    await act(async () => {
      root = hydrateRoot(container, element);
    });
    expect(consoleError).not.toHaveBeenCalled();

    expectNativeElementSemantics(containerQuery);
  } finally {
    consoleError.mockRestore();
    if (root) {
      await act(async () => root?.unmount());
    }
    container.remove();
    scope.IS_REACT_ACT_ENVIRONMENT = previousActEnvironment;
  }
});
