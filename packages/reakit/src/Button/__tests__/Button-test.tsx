import * as React from "react";
import { render, axe } from "reakit-test-utils";
import { Button } from "../Button";

test("render", () => {
  const { getByText } = render(<Button>button</Button>);
  expect(getByText("button")).toMatchInlineSnapshot(`
    <button
      type="button"
    >
      button
    </button>
  `);
});

test("render with no a11y violations", async () => {
  const { container } = render(<Button>box</Button>);
  const results = await axe(container.innerHTML);

  expect(results).toHaveNoViolations();
});

test("render anchor", () => {
  const { getByText } = render(<Button as="a">button</Button>);
  expect(getByText("button")).toMatchInlineSnapshot(`
<a>
  button
</a>
`);
});

test("render div", () => {
  const { getByText } = render(<Button as="div">button</Button>);
  expect(getByText("button")).toMatchInlineSnapshot(`
<div
  role="button"
  tabindex="0"
>
  button
</div>
`);
});
