import * as React from "react";
import { render } from "react-testing-library";
import Menu from "../Menu";

test("html attrs", () => {
  const { getByTestId } = render(
    <Menu id="test" aria-label="test" data-testid="test" />
  );
  expect(getByTestId("test")).toHaveAttribute("id", "test");
  expect(getByTestId("test")).toHaveAttribute("aria-label", "test");
});

test("styled", () => {
  const { container } = render(<Menu />);
  expect(container.firstChild).toMatchSnapshot();
});
