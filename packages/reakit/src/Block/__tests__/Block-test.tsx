import * as React from "react";
import { render } from "react-testing-library";
import Block from "../Block";

test("html attrs", () => {
  const { getByText } = render(
    <Block id="test" aria-label="test">
      test
    </Block>
  );
  expect(getByText("test")).toHaveAttribute("id", "test");
  expect(getByText("test")).toHaveAttribute("aria-label", "test");
});

test("styled", () => {
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
