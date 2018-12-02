import * as React from "react";
import { render } from "react-testing-library";
import Button from "../Button";

test("html attrs", () => {
  const { getByTestId } = render(
    <Button id="test" aria-label="test" data-testid="test" />
  );

  expect(getByTestId("test")).toHaveAttribute("id", "test");
  expect(getByTestId("test")).toHaveAttribute("aria-label", "test");
});

test("styled", () => {
  const { container } = render(<Button />);
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

<button
  class="c0"
/>
`);
});
