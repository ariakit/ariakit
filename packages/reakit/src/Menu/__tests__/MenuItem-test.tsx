import * as React from "react";
import { render } from "react-testing-library";
import MenuItem from "../MenuItem";

test("html attrs", () => {
  const { getByTestId } = render(
    <MenuItem id="test" aria-label="test" data-testid="test" />
  );
  expect(getByTestId("test")).toHaveAttribute("id", "test");
  expect(getByTestId("test")).toHaveAttribute("aria-label", "test");
});

test("styled", () => {
  const { container } = render(<MenuItem />);
  expect(container.firstChild).toMatchSnapshot();
});

test("styled disabled", () => {
  const { container } = render(<MenuItem disabled />);
  expect(container.firstChild).toMatchSnapshot();
});
