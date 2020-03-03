import * as React from "react";
import { render } from "reakit-test-utils";
import { Button } from "../Button";

test("render", () => {
  const { getByText } = render(<Button>button</Button>);
  expect(getByText("button")).toMatchInlineSnapshot(`
    <button
      data-tabbable="true"
      type="button"
    >
      button
    </button>
  `);
});

test("render anchor", () => {
  const { getByText } = render(<Button as="a">button</Button>);
  expect(getByText("button")).toMatchInlineSnapshot(`
<a
  data-tabbable="true"
>
  button
</a>
`);
});

test("render div", () => {
  const { getByText } = render(<Button as="div">button</Button>);
  expect(getByText("button")).toMatchInlineSnapshot(`
<div
  data-tabbable="true"
  role="button"
  tabindex="0"
>
  button
</div>
`);
});
