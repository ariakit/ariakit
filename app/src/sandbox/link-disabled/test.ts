import { click, focus, press, q } from "@ariakit/test";
import { render } from "@ariakit/test/react";
import { act, createElement } from "react";
import { hydrateRoot } from "react-dom/client";
import { renderToString } from "react-dom/server";
import { expect, test, vi } from "vitest";
import { ServerLinks, WarningLinks } from "./index.react.tsx";

const destinationAttributes = [
  "href",
  "itemprop",
  "target",
  "download",
  "ping",
  "rel",
  "hreflang",
  "referrerpolicy",
  "type",
];

const restoredDestination = {
  href: "#destination-contract",
  itemprop: "url",
  target: "_blank",
  download: "contract.html",
  ping: "/analytics/link",
  rel: "next",
  hreflang: "en",
  referrerpolicy: "no-referrer",
  type: "text/html",
};

function expectNoDestination(element: Element) {
  for (const attribute of destinationAttributes) {
    expect(element).not.toHaveAttribute(attribute);
  }
}

test("keeps enabled and placeholder anchors native", () => {
  const enabled = q.link("Read field notes");
  expect(enabled).toHaveAttribute("href", "#field-notes");
  expect(enabled).not.toHaveAttribute("role");
  expect(enabled).not.toHaveAttribute("aria-disabled");
  expect(enabled).not.toHaveAttribute("tabindex");
  expect(enabled).not.toHaveAttribute("disabled");

  const placeholder = q.text("Placeholder anchor");
  expect(placeholder).toHaveProperty("tagName", "A");
  expect(placeholder).not.toHaveAttribute("href");
  expect(placeholder).not.toHaveAttribute("role");

  const composed = q.link("Composed native anchor");
  expect(composed).toHaveAttribute("href", "#contract-composed");
  expect(composed).toHaveAttribute("data-composed");

  const functionRendered = q.link("Function-rendered anchor");
  expect(functionRendered).toHaveAttribute("href", "#contract-function");
  expect(functionRendered).toHaveAttribute("data-function-render");

  expect(q.link("Hook-generated anchor")).toHaveAttribute(
    "href",
    "#contract-hook",
  );
});

test("withholds every destination attribute while disabled", () => {
  const link = q.link("Raw destination attribute probe");
  expectNoDestination(link);
  expect(link).toHaveAttribute("role", "link");
  expect(link).toHaveAttribute("aria-disabled", "true");
  expect(link).toHaveAttribute("tabindex", "-1");
  expect(link).not.toHaveAttribute("disabled");
});

test("restores every destination attribute declaratively", async () => {
  const probe = q.link("Raw destination attribute probe");
  await click(q.button("Restore destination attributes"));
  expect(q.link("Raw destination attribute probe")).toBe(probe);
  for (const [attribute, value] of Object.entries(restoredDestination)) {
    expect(probe).toHaveAttribute(attribute, value);
  }
});

test("keeps interactive pagination destinations realistic", async () => {
  await click(q.link("Next page"));
  expect(q.text("Chapter 2 of 3")).toBeVisible();
  const previous = q.link("Previous page");
  expect(previous).toHaveAttribute("href", "#chapter-1");
  expect(previous).not.toHaveAttribute("target");
  expect(previous).not.toHaveAttribute("download");
  expect(previous).not.toHaveAttribute("ping");
});

test("supports accessible, ARIA, and inactive Focusable states", () => {
  const accessible = q.link("Disabled reachable");
  expectNoDestination(accessible);
  expect(accessible).toHaveAttribute("aria-disabled", "true");
  expect(accessible).toHaveAttribute("tabindex", "0");

  const ariaDisabled = q.link("ARIA-disabled");
  expectNoDestination(ariaDisabled);
  expect(ariaDisabled).toHaveAttribute("aria-disabled", "true");
  expect(ariaDisabled).toHaveAttribute("tabindex", "-1");

  const focusableOff = q.link("Focusable behavior off");
  expect(focusableOff).toHaveAttribute("href", "#contract-focusable-off");
  expect(focusableOff).not.toHaveAttribute("aria-disabled");
  expect(focusableOff).not.toHaveAttribute("tabindex");
});

test("keeps only the explainable disabled link in the tab order", async () => {
  await focus(q.button("Before links"));
  await press.Tab();
  expect(q.link("Reachable disabled link")).toHaveFocus();

  await press.Tab();
  expect(q.button("After links")).toHaveFocus();
});

test("keeps the same anchor focused across disabled transitions", async () => {
  const link = q.link("Release notes");

  await click(q.button("Disable while focused"));
  expect(q.link("Release notes")).toBe(link);
  expect(link).toHaveFocus();
  expectNoDestination(link);
  expect(link).toHaveAttribute("aria-disabled", "true");

  await click(q.button("Enable while focused"));
  expect(q.link("Release notes")).toBe(link);
  expect(link).toHaveFocus();
  expect(link).toHaveAttribute("href", "#release-notes");
});

test("preserves an outer menu item role", async () => {
  await click(q.button("Workspace menu"));
  const item = q.menuitem("Enterprise settings");
  expect(item).toHaveAttribute("role", "menuitem");
  expect(item).toHaveAttribute("aria-disabled", "true");
  expectNoDestination(item);
  await press.Escape();
});

test("renders final disabled semantics before hydration", async () => {
  const scope = globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean };
  const previousActEnvironment = scope.IS_REACT_ACT_ENVIRONMENT;
  scope.IS_REACT_ACT_ENVIRONMENT = true;
  const element = createElement(ServerLinks, {});
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

    const query = q.within(container);
    const enabled = query.link("Server-enabled link");
    expect(enabled.outerHTML).toBe(
      '<a href="#server-enabled">Server-enabled link</a>',
    );

    const skipped = query.link("Server-skipped link");
    expectNoDestination(skipped);
    expect(skipped).toHaveAttribute("role", "link");
    expect(skipped).toHaveAttribute("aria-disabled", "true");
    expect(skipped).toHaveAttribute("tabindex", "-1");
    expect(skipped).not.toHaveAttribute("disabled");

    const reachable = query.link("Server-reachable link");
    expectNoDestination(reachable);
    expect(reachable).toHaveAttribute("role", "link");
    expect(reachable).toHaveAttribute("aria-disabled", "true");
    expect(reachable).toHaveAttribute("tabindex", "0");
    expect(reachable).not.toHaveAttribute("disabled");

    const conflict = query.link("Disabled wins conflicting ARIA");
    expectNoDestination(conflict);
    expect(conflict).toHaveAttribute("role", "link");
    expect(conflict).toHaveAttribute("aria-disabled", "true");
    expect(conflict).toHaveAttribute("tabindex", "-1");
    expect(conflict).not.toHaveAttribute("disabled");

    await act(async () => {
      root = hydrateRoot(container, element);
    });
    expect(consoleError).not.toHaveBeenCalled();
    expect(query.link("Server-enabled link")).toBe(enabled);
    expect(query.link("Server-skipped link")).toBe(skipped);
    expect(query.link("Server-reachable link")).toBe(reachable);
    expect(query.link("Disabled wins conflicting ARIA")).toBe(conflict);
    expectNoDestination(query.link("Server-skipped link"));
    expect(query.link("Server-skipped link")).toHaveAttribute("tabindex", "-1");
    expectNoDestination(query.link("Server-reachable link"));
    expect(query.link("Server-reachable link")).toHaveAttribute(
      "tabindex",
      "0",
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

test("warns about render props that cannot honor the contract", async () => {
  using consoleWarn = vi.spyOn(console, "warn").mockImplementation(() => {});
  const { unmount } = await render(createElement(WarningLinks, {}), {
    strictMode: true,
  });

  try {
    expect(consoleWarn.mock.calls).toEqual([
      [
        "This disabled Link still has an `href`. A component can add props " +
          "to the element in the `render` prop, but it can't take one " +
          "away, so the link can still be opened in a new tab, copied " +
          "from the context menu, and listed as a link by assistive " +
          "technology. Pass the URL to `Link` and it withholds it while " +
          "the link is disabled.",
      ],
      [
        "Link renders an anchor element. The `render` prop received a <div> " +
          "element, which can't be a link. Use Command or Button for elements " +
          "that perform an action instead.",
      ],
    ]);
  } finally {
    unmount();
  }
});
