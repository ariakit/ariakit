import * as React from "react";
import { render } from "react-testing-library";
import Portal from "../Portal";

test("html attrs", () => {
  const { getByTestId } = render(
    <Portal id="test" textAlign="center" data-testid="test" />
  );
  expect(getByTestId("test")).toHaveAttribute("id", "test");
  expect(getByTestId("test")).toHaveAttribute("style", "text-align: center;");
  expect(getByTestId("test")).toHaveAttribute("data-testid", "test");
});

test("styled", () => {
  const { container } = render(<Portal />);
  expect(container.firstChild).toBe(null);
});

test("append div to body on mount", () => {
  const { getByText } = render(<Portal>Test</Portal>);
  expect(getByText("Test")).toBeInTheDocument();
});

test("unmount", () => {
  const { getByTestId, unmount } = render(<Portal data-testid="test" />);
  const portalNode = getByTestId("test");
  expect(document.body.contains(portalNode)).toBe(true);
  unmount();
  expect(document.body.contains(portalNode)).toBe(false);
});
