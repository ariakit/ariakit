import * as React from "react";
import { render } from "react-testing-library";
import PopoverArrow from "../PopoverArrow";

test("html attrs", () => {
  const { getByTestId } = render(
    <PopoverArrow data-testid="test" aria-label="test" />
  );
  expect(getByTestId("test")).toHaveAttribute("aria-label", "test");
});

test("fillColor", () => {
  const { container } = render(<PopoverArrow fillColor="red" />);
  expect(container.firstChild).toMatchSnapshot();
});

test("strokeColor", () => {
  const { container } = render(<PopoverArrow strokeColor="red" />);
  expect(container.firstChild).toMatchSnapshot();
});

test("styled", () => {
  const { container } = render(<PopoverArrow />);
  expect(container.firstChild).toMatchSnapshot();
});
