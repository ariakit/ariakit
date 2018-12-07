import * as React from "react";
import { render } from "react-testing-library";
import TabsNext, { TabsNextProps } from "../TabsNext";

const props: TabsNextProps = {
  next: jest.fn()
};

test("html attrs", () => {
  const { getByTestId } = render(
    <TabsNext id="test" aria-label="test" data-testid="test" {...props} />
  );
  expect(getByTestId("test")).toHaveAttribute("id", "test");
  expect(getByTestId("test")).toHaveAttribute("aria-label", "test");
});

test("styled", () => {
  const { container } = render(<TabsNext {...props} />);
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
