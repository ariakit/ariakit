import * as React from "react";
import { render } from "react-testing-library";
import Sidebar from "../Sidebar";

test("html attrs", () => {
  const { getByTestId } = render(
    <Sidebar id="test" aria-label="test" data-testid="test" />
  );
  expect(getByTestId("test")).toHaveAttribute("data-testid", "test");
  expect(getByTestId("test")).toHaveAttribute("aria-label", "test");
});

test("styled", () => {
  const { container } = render(<Sidebar />);
  expect(container.firstChild).toMatchSnapshot();
});

test("styled visible", () => {
  const { container } = render(<Sidebar visible />);
  expect(container.firstChild).toMatchSnapshot();
});

test("align right", () => {
  const { container } = render(<Sidebar visible align="right" />);
  expect(container.firstChild).toMatchSnapshot();
});
