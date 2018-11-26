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
  expect(container.firstChild).toMatchInlineSnapshot(`
.c1 {
  margin: unset;
  padding: unset;
  border: unset;
  background: unset;
  font: unset;
  font-family: inherit;
  font-size: 100%;
  box-sizing: border-box;
  background-color: unset;
  color: inherit;
}

.c0 {
  border-color: currentColor;
  border-style: solid;
  opacity: 0.2;
  margin: 1em 0;
  height: 0;
  border-width: 1px 0 0 0;
}

<hr
  class="c0 c1"
/>
`);
});

test("styled vertical", () => {
  const { container } = render(<Divider vertical />);
  expect(container.firstChild).toMatchInlineSnapshot(`
.c1 {
  margin: unset;
  padding: unset;
  border: unset;
  background: unset;
  font: unset;
  font-family: inherit;
  font-size: 100%;
  box-sizing: border-box;
  background-color: unset;
  color: inherit;
}

.c0 {
  border-color: currentColor;
  border-style: solid;
  opacity: 0.2;
  margin: 0 1em;
  min-height: 100%;
  width: 0;
  border-width: 0 0 0 1px;
}

<hr
  class="c0 c1"
/>
`);
});
