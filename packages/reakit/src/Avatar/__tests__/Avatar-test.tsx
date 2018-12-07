import * as React from "react";
import { render } from "react-testing-library";
import Avatar from "../Avatar";

test("html attrs", () => {
  const { getByAltText } = render(
    <Avatar id="test" aria-label="test" alt="test" />
  );
  expect(getByAltText("test")).toHaveAttribute("id", "test");
  expect(getByAltText("test")).toHaveAttribute("aria-label", "test");
});

test("styled", () => {
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

.c0:focus:not(:focus-visible) {
  outline: none;
}

<img
  class="c0"
/>
`);
});
