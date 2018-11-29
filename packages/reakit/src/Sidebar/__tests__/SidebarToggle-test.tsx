import * as React from "react";
import { render } from "react-testing-library";
import SidebarToggle from "../SidebarToggle";

test("html attrs", () => {
  const { getByText } = render(
    <SidebarToggle id="test" aria-label="test" toggle={jest.fn()}>
      test
    </SidebarToggle>
  );
  expect(getByText("test")).toHaveAttribute("id", "test");
  expect(getByText("test")).toHaveAttribute("aria-label", "test");
});

test("styled", () => {
  const { container } = render(<SidebarToggle toggle={jest.fn()} />);
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
