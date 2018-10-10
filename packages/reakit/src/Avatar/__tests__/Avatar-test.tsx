import * as React from "react";
import { render } from "react-testing-library";
import Avatar from "../Avatar";

test("Avatar html attrs", () => {
  const { container } = render(<Avatar id="Avatar" aria-label="Avatar" />);
  expect(container.firstChild).toHaveAttribute("id", "Avatar");
  expect(container.firstChild).toHaveAttribute("aria-label", "Avatar");
});

test("Avatar styled", () => {
  const { container } = render(<Avatar />);
  expect(container.firstChild).toMatchInlineSnapshot(`
.c0 {
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

<img
  class="c0"
/>
`);
});
