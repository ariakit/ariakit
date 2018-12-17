import * as React from "react";
import { render } from "react-testing-library";
import Card from "../Card";

test("html attrs", () => {
  const { getByTestId } = render(
    <Card id="test" aria-label="test" data-testid="test" />
  );

  expect(getByTestId("test")).toHaveAttribute("id", "test");
  expect(getByTestId("test")).toHaveAttribute("aria-label", "test");
});

test("styled", () => {
  const { container } = render(<Card />);
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

.c1:focus:not(:focus-visible) {
  outline: none;
}

.c0 {
  display: inline-block;
}

.c0.c0 > *:not(.c2) {
  margin: 1rem;
}

<div
  class="c0 c1"
/>
`);
});

test("styled gutter", () => {
  const { container } = render(<Card gutter={10} />);
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

.c1:focus:not(:focus-visible) {
  outline: none;
}

.c0 {
  display: inline-block;
}

.c0.c0 > *:not(.c2) {
  margin: 10px;
}

<div
  class="c0 c1"
/>
`);
});
