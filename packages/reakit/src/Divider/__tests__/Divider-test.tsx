import * as React from "react";
import { render } from "react-testing-library";
import Divider from "../Divider";

test("html attrs", () => {
  const { getByTestId } = render(
    <Divider id="test" aria-label="test" data-testid="test" />
  );

  expect(getByTestId("test")).toHaveAttribute("id", "test");
  expect(getByTestId("test")).toHaveAttribute("aria-label", "test");
});

test("styled", () => {
  const { container } = render(<Divider />);
  expect(container.firstChild).toMatchSnapshot();
});

test("styled vertical", () => {
  const { container } = render(<Divider vertical />);
  expect(container.firstChild).toMatchSnapshot();
});
