import * as React from "react";
import { render } from "react-testing-library";
import SidebarHide from "../SidebarHide";

test("html attrs", () => {
  const { getByTestId } = render(
    <SidebarHide
      id="test"
      aria-label="test"
      data-testid="test"
      hide={jest.fn()}
    />
  );
  expect(getByTestId("test")).toHaveAttribute("data-testid", "test");
  expect(getByTestId("test")).toHaveAttribute("aria-label", "test");
});

test("styled", () => {
  const { container } = render(<SidebarHide hide={jest.fn()} />);
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

<button
  class="c0"
/>
`);
});
