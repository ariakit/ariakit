import * as React from "react";
import { render } from "react-testing-library";
import { Hidden } from "../Hidden";

test("render", () => {
  const { getByText } = render(<Hidden>test</Hidden>);
  expect(getByText("test")).toMatchInlineSnapshot(`
<div
  aria-hidden="true"
  hidden=""
  role="region"
>
  test
</div>
`);
});

test("render visible", () => {
  const { getByText } = render(<Hidden visible>test</Hidden>);
  expect(getByText("test")).toMatchInlineSnapshot(`
<div
  aria-hidden="false"
  role="region"
>
  test
</div>
`);
});
