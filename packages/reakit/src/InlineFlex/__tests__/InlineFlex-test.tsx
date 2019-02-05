import * as React from "react";
import { render } from "react-testing-library";
import InlineFlex from "../InlineFlex";

test("html attrs", () => {
  const { getByTestId } = render(
    <InlineFlex id="test" aria-label="test" data-testid="test" />
  );

  expect(getByTestId("test")).toHaveAttribute("id", "test");
  expect(getByTestId("test")).toHaveAttribute("aria-label", "test");
});

test("styled", () => {
  const { container } = render(<InlineFlex />);
  expect(container.firstChild).toMatchInlineSnapshot(`
.c2 {
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

.c2:focus:not(:focus-visible) {
  outline: none;
}

.c1 {
  display: -webkit-box;
  display: -webkit-flex;
  display: -ms-flexbox;
  display: flex;
}

.c0 {
  display: -webkit-inline-box;
  display: -webkit-inline-flex;
  display: -ms-inline-flexbox;
  display: inline-flex;
}

<div
  class="c0 c1 c2"
/>
`);
});
