import * as React from "react";
import { render } from "react-testing-library";
import InlineBlock from "../InlineBlock";

test("html attrs", () => {
  const { getByTestId } = render(
    <InlineBlock id="test" aria-label="test" data-testid="test" />
  );

  expect(getByTestId("test")).toHaveAttribute("id", "test");
  expect(getByTestId("test")).toHaveAttribute("aria-label", "test");
});

test("styled", () => {
  const { container } = render(<InlineBlock />);
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

.c1:focus:not(:focus-visible) {
  outline: none;
}

.c0 {
  display: inline-block;
}

<div
  class="c0 c1"
/>
`);
});
