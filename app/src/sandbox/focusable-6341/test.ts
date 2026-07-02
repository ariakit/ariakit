import { q } from "@ariakit/test";
import { createElement } from "react";
import { renderToString } from "react-dom/server";
import { expect, test, vi } from "vitest";
import Example from "./index.react.tsx";

// React 18's renderToString warns that useLayoutEffect does nothing on the
// server when it runs in a DOM test environment like this one. Real servers
// don't have a DOM, so useSafeLayoutEffect resolves to useEffect there and the
// warning doesn't apply. Silence only that warning so failOnConsole keeps
// catching everything else.
function renderToStringSilencingLayoutEffectWarning() {
  const originalError = console.error;
  const spy = vi.spyOn(console, "error").mockImplementation((...args) => {
    if (
      String(args[0]).includes("useLayoutEffect does nothing on the server")
    ) {
      return;
    }
    originalError(...args);
  });
  try {
    return renderToString(createElement(Example));
  } finally {
    spy.mockRestore();
  }
}

// See https://github.com/ariakit/ariakit/issues/6341
// renderToString produces the exact HTML a server framework (Next.js, Remix,
// etc.) sends to the browser, so these tests assert what keyboard users get
// before hydration completes or while JavaScript is disabled. The test harness
// also client-renders this sandbox into the document, but that hydrated copy
// doesn't exhibit the bug, so the queries are scoped to a detached container
// holding only the server markup.
function renderServerMarkup() {
  const container = document.createElement("div");
  container.innerHTML = renderToStringSilencingLayoutEffectWarning();
  return q.within(container);
}

test("div-based Focusable server-renders in the tab order", () => {
  const server = renderServerMarkup();
  expect(server.text.ensure("Focusable card")).toHaveAttribute("tabindex", "0");
});

test("disabled Focusable doesn't server-render an invalid disabled attribute", () => {
  const server = renderServerMarkup();
  const disabledCard = server.text.ensure("Disabled focusable card");
  expect(disabledCard).toHaveAttribute("aria-disabled", "true");
  expect(disabledCard).not.toHaveAttribute("disabled");
  expect(disabledCard).not.toHaveAttribute("tabindex");
});

test("div-based TooltipAnchor server-renders in the tab order", () => {
  const server = renderServerMarkup();
  expect(server.text.ensure("Tooltip anchor")).toHaveAttribute("tabindex", "0");
});

test("virtual focus composite container server-renders in the tab order", () => {
  const server = renderServerMarkup();
  expect(server.toolbar("Composite")).toHaveAttribute("tabindex", "0");
});

// The submenu button covers the MenuButton case, which renders as a div when
// nested in another menu.
test("div-based menu items server-render in the tab order", () => {
  const server = renderServerMarkup();
  expect(server.text.ensure("Menu item")).toHaveAttribute("tabindex", "0");
  expect(server.text.ensure("Submenu button")).toHaveAttribute("tabindex", "0");
});

test("disabled menu item doesn't server-render a disabled attribute", () => {
  const server = renderServerMarkup();
  const disabledItem = server.text.ensure("Disabled menu item");
  expect(disabledItem).toHaveAttribute("aria-disabled", "true");
  expect(disabledItem).not.toHaveAttribute("disabled");
  expect(disabledItem).not.toHaveAttribute("tabindex");
});

test("native buttons keep their server-rendered semantics", () => {
  const server = renderServerMarkup();
  expect(server.button("Before")).not.toHaveAttribute("tabindex");
  expect(server.button("After")).not.toHaveAttribute("tabindex");
  const disabledButton = server.text.ensure("Disabled button");
  expect(disabledButton).toHaveAttribute("disabled");
  expect(disabledButton).not.toHaveAttribute("tabindex");
});
