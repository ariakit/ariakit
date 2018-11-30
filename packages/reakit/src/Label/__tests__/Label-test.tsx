import * as React from "react";
import { render } from "react-testing-library";
import Label from "../Label";

test("html attrs", () => {
  const { getByTestId } = render(
    <Label id="test" aria-label="test" data-testid="test" />
  );

  expect(getByTestId("test")).toHaveAttribute("id", "test");
  expect(getByTestId("test")).toHaveAttribute("aria-label", "test");
});

test("styled", () => {
  const { container } = render(<Label />);
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
  display: inline-block;
}

<label
  class="c0 c1"
/>
`);
});
