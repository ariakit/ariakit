import * as React from "react";
import { render } from "react-testing-library";
import Block from "../Block";

test("Block html attrs", () => {
  const { container } = render(<Block id="Block" aria-label="Block" />);
  expect(container.firstChild).toHaveAttribute("id", "Block");
  expect(container.firstChild).toHaveAttribute("aria-label", "Block");
});

test("Block styled", () => {
  const { container } = render(<Block />);
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
  display: block;
}

<div
  class="c0 c1"
/>
`);
});
