import * as React from "react";
import { render } from "react-testing-library";
import Stack from "../Stack";

test("HTML attributes", () => {
  const { getByTestId } = render(
    <Stack id="test" aria-label="test" data-testid="test" />
  );

  expect(getByTestId("test")).toHaveAttribute("id", "test");
  expect(getByTestId("test")).toHaveAttribute("aria-label", "test");
});

test("Default", () => {
  const { container } = render(<Stack />);
  expect(container.firstChild).toMatchSnapshot();
});

test("Anchor", () => {
  const { container } = render(<Stack anchor={["bottom", "right"]} />);
  expect(container.firstChild).toMatchSnapshot();
});
