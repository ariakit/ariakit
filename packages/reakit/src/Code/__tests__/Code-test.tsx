import * as React from "react";
import { render } from "react-testing-library";
import Code from "../Code";

test("html attrs", () => {
  const { getByTestId } = render(
    <Code id="test" aria-label="test" data-testid="test" />
  );

  expect(getByTestId("test")).toHaveAttribute("id", "test");
  expect(getByTestId("test")).toHaveAttribute("aria-label", "test");
});

test("styled", () => {
  const { container } = render(<Code />);
  expect(container.firstChild).toMatchSnapshot();
});

test("styled block", () => {
  const { container } = render(<Code block />);
  expect(container.firstChild).toMatchSnapshot();
});

test("styled with custom CSS class", () => {
  const cssClassName = "chuck-norris";
  const { getByTestId } = render(
    <Code codeClassName={cssClassName} data-testid="test" />
  );

  expect(getByTestId("test").className).toContain(cssClassName);
});
