import * as React from "react";
import { render } from "react-testing-library";
import TableWrapper from "../TableWrapper";

test("html attrs", () => {
  const { getByTestId } = render(
    <TableWrapper id="test" aria-label="test" data-testid="test" />
  );
  expect(getByTestId("test")).toHaveAttribute("data-testid", "test");
  expect(getByTestId("test")).toHaveAttribute("aria-label", "test");
});

test("styled", () => {
  const { container } = render(<TableWrapper />);
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
  max-width: 100%;
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
}

<div
  class="c0 c1"
/>
`);
});
