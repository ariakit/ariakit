import * as React from "react";
import { render } from "react-testing-library";
import Button from "../Button";

test("html attrs", () => {
  const { getByTestId } = render(
    <Button id="test" aria-label="test" data-testid="test" />
  );

  expect(getByTestId("test")).toHaveAttribute("id", "test");
  expect(getByTestId("test")).toHaveAttribute("aria-label", "test");
});

test("styled", () => {
  const { container } = render(<Button />);
  expect(container.firstChild).toMatchSnapshot();
});
