import * as React from "react";
import { render } from "react-testing-library";
import Blockquote from "../Blockquote";

test("html attrs", () => {
  const { getByTestId } = render(
    <Blockquote id="test" aria-label="test" data-testid="test" />
  );
  expect(getByTestId("test")).toHaveAttribute("data-testid", "test");
  expect(getByTestId("test")).toHaveAttribute("aria-label", "test");
});

test("styled", () => {
  const { container } = render(<Blockquote />);
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

<blockquote
  class="c0"
/>
`);
});
