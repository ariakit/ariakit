import * as React from "react";
import { render } from "react-testing-library";
import Field from "../Field";

test("html attrs", () => {
  const { getByTestId } = render(
    <Field id="test" aria-label="test" data-testid="test" />
  );

  expect(getByTestId("test")).toHaveAttribute("id", "test");
  expect(getByTestId("test")).toHaveAttribute("aria-label", "test");
});

test("styled", () => {
  const { container } = render(<Field />);
  expect(container.firstChild).toMatchSnapshot();
});
