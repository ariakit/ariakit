import { click, focus, press, q } from "@ariakit/test";
import type { ReactNode } from "react";
import { act, createElement } from "react";
import type { Root } from "react-dom/client";
import { hydrateRoot } from "react-dom/client";
import { renderToString } from "react-dom/server";
import { expect, test, vi } from "vitest";
import Example from "./index.react.tsx";

function renderServer(element: ReactNode) {
  const consoleError = vi.spyOn(console, "error").mockImplementation(() => {});
  try {
    const html = renderToString(element);
    const unexpectedErrors = consoleError.mock.calls.filter(([message]) => {
      return !String(message).includes(
        "useLayoutEffect does nothing on the server",
      );
    });
    expect(unexpectedErrors).toEqual([]);
    return html;
  } finally {
    consoleError.mockRestore();
  }
}

function getCommandModifiers(element: Element) {
  const keys = element.getAttribute("aria-keyshortcuts");
  expect(keys).toMatch(/^(Control|Meta)\+Shift\+P$/);
  return {
    ctrlKey: keys?.startsWith("Control+") ?? false,
    metaKey: keys?.startsWith("Meta+") ?? false,
    shiftKey: true,
  };
}

// https://github.com/ariakit/ariakit/issues/7069
test("keeps inferred core-store output hydration-safe", async () => {
  const container = document.createElement("div");
  container.innerHTML = renderServer(createElement(Example));
  document.body.appendChild(container);
  const getRefreshButton = () => container.querySelector(".ps-button-muted");
  expect(getRefreshButton()).not.toHaveAttribute("aria-keyshortcuts");
  expect(getRefreshButton()?.querySelector("kbd")).toBeEmptyDOMElement();

  const actEnvironment = globalThis as {
    IS_REACT_ACT_ENVIRONMENT?: boolean;
  };
  const previousActEnvironment = actEnvironment.IS_REACT_ACT_ENVIRONMENT;
  actEnvironment.IS_REACT_ACT_ENVIRONMENT = true;
  const consoleError = vi.spyOn(console, "error").mockImplementation(() => {});
  let root: Root | undefined;
  try {
    await act(async () => {
      root = hydrateRoot(container, createElement(Example));
    });
    expect(consoleError).not.toHaveBeenCalled();
    expect(getRefreshButton()?.getAttribute("aria-keyshortcuts")).toMatch(
      /^(Control|Meta)\+Shift\+P$/,
    );
    expect(getRefreshButton()?.querySelector("kbd")).not.toBeEmptyDOMElement();
  } finally {
    try {
      if (root) {
        await act(async () => root?.unmount());
      }
    } finally {
      consoleError.mockRestore();
      actEnvironment.IS_REACT_ACT_ENVIRONMENT = previousActEnvironment;
      container.remove();
    }
  }
});

// https://github.com/ariakit/ariakit/issues/7069
test("runs the external command through its programmatic toolbar control", async () => {
  expect(q.region("Homepage preview")).toHaveAccessibleName("Homepage preview");
  const refreshes = q.status("Preview refreshes");
  const refreshButton = q.button(/^Refresh preview/);
  expect(refreshButton).toHaveAccessibleName("Refresh preview");
  expect(refreshButton).toHaveTextContent("P");

  await click(refreshButton);
  expect(refreshes).toHaveTextContent("1 preview refreshes");
  expect(q.text("Refresh from programmatic")).toBeVisible();
});

// https://github.com/ariakit/ariakit/issues/7069
test("shares the external store with the parent React provider", async () => {
  const refreshes = q.status("Preview refreshes");
  const modifiers = getCommandModifiers(q.button(/^Refresh preview/));
  await focus(q.button("Publish"));

  await press("p", null, modifiers);
  expect(refreshes).toHaveTextContent("1 preview refreshes");
  expect(q.text("Refresh from keyboard")).toBeVisible();
});

// https://github.com/ariakit/ariakit/issues/7069
test("uses the composed-path origin inside an open shadow root", async () => {
  const refreshes = q.status("Preview refreshes");
  const shadowCard = document
    .querySelector<HTMLElement>("[data-shadow-host]")
    ?.shadowRoot?.querySelector<HTMLElement>(".shadow-card");
  expect(shadowCard).toBeInTheDocument();
  const shadowQ = q.within(shadowCard);
  const command = shadowQ.button(/^Refresh from shadow root/);
  const textbox = shadowQ.textbox("Shadow note");
  const options = { ...getCommandModifiers(command), composed: true };

  expect(command).toHaveAccessibleName("Refresh from shadow root");

  await focus(command);
  await press("p", command, options);
  expect(refreshes).toHaveTextContent("1 preview refreshes");

  await focus(textbox);
  await press("p", textbox, options);
  expect(refreshes).toHaveTextContent("1 preview refreshes");
});

// https://github.com/ariakit/ariakit/issues/7069
test("toggles the slotted reference inert boundary without React warnings", async () => {
  const shadowCard = document
    .querySelector<HTMLElement>("[data-shadow-host]")
    ?.shadowRoot?.querySelector<HTMLElement>(".shadow-card");
  expect(shadowCard).toBeInTheDocument();
  const slotHost = shadowCard?.querySelector<HTMLElement>("[data-slot-host]");
  const inertBoundary = slotHost?.shadowRoot?.querySelector(".slot-boundary");
  const checkbox = q.within(shadowCard).checkbox("Inert reference");

  expect(inertBoundary).not.toHaveAttribute("inert");
  await click(checkbox);
  expect(inertBoundary).toHaveAttribute("inert", "");
  await click(checkbox);
  expect(inertBoundary).not.toHaveAttribute("inert");
});
