import "jest-styled-components";
import * as React from "react";
import { render } from "react-testing-library";
import Avatar from "../Avatar";

test("Avatar", () => {
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
