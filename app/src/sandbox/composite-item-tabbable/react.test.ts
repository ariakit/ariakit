import { render } from "@testing-library/react";
import type { FunctionComponent } from "react";
import { createElement } from "react";
import { renderToString } from "react-dom/server";
import { expect, test, vi } from "vitest";
import {
  RovingFixture,
  SeededFixture,
  VirtualFocusFixture,
} from "./index.react.tsx";

function renderOnServer(Fixture: FunctionComponent) {
  // React 18 warns about useLayoutEffect on the server. The stores use it to
  // subscribe, which is a no-op there.
  using consoleError = vi.spyOn(console, "error").mockImplementation(() => {});
  const markup = renderToString(createElement(Fixture));
  const unexpected = consoleError.mock.calls.filter(
    ([message]) =>
      !String(message).includes("useLayoutEffect does nothing on the server"),
  );
  expect(unexpected).toEqual([]);
  return markup;
}

// Items must keep their native tab order before hydration so keyboard users can
// reach them while JavaScript is still loading.
// https://github.com/ariakit/ariakit/pull/2601
test.each([
  ["a roving composite", RovingFixture],
  ["a virtual focus composite", VirtualFocusFixture],
  ["a store seeded with items", SeededFixture],
])("renders %s without tabindex on the server", (_, Fixture) => {
  expect(renderOnServer(Fixture)).not.toContain("tabindex");
});

// Rendering directly, instead of through the @ariakit/test helper, keeps the
// assertion in the commit where the composite element is already published but
// the rendered items are not.
// https://github.com/ariakit/ariakit/pull/6832
test("keeps virtual focus items out of the tab order on the first commit", () => {
  const { container } = render(createElement(VirtualFocusFixture));
  const items = [...container.querySelectorAll("button")];
  expect(items.map((item) => item.getAttribute("tabindex"))).toEqual([
    "-1",
    "-1",
  ]);
});
