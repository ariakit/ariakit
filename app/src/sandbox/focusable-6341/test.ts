import { q } from "@ariakit/test";
import { createElement } from "react";
import { renderToString } from "react-dom/server";
import { expect, test } from "vitest";
import Example from "./index.react.tsx";

// See https://github.com/ariakit/ariakit/issues/6341
// renderToString produces the exact HTML a server framework (Next.js, Remix,
// etc.) sends to the browser, so these tests assert what keyboard users get
// before hydration completes or while JavaScript is disabled. The test harness
// also client-renders this sandbox into the document, but that hydrated copy
// doesn't exhibit the bug, so the queries are scoped to a detached container
// holding only the server markup.
function renderServerMarkup() {
  const container = document.createElement("div");
  container.innerHTML = renderToString(createElement(Example));
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

test("native buttons keep their server-rendered semantics", () => {
  const server = renderServerMarkup();
  expect(server.button("Before")).not.toHaveAttribute("tabindex");
  expect(server.button("After")).not.toHaveAttribute("tabindex");
  const disabledButton = server.text.ensure("Disabled button");
  expect(disabledButton).toHaveAttribute("disabled");
  expect(disabledButton).not.toHaveAttribute("tabindex");
});
