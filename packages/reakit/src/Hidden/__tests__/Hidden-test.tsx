import * as React from "react";
import { render } from "react-testing-library";
import { Hidden } from "../Hidden";

test("render", () => {
  const { getByText } = render(<Hidden>hidden</Hidden>);
  expect(getByText("hidden")).toMatchInlineSnapshot(`
    <div
      class="hidden"
      hidden=""
      role="region"
    >
      hidden
    </div>
  `);
});

test("render visible", () => {
  const { getByText } = render(<Hidden visible>hidden</Hidden>);
  expect(getByText("hidden")).toMatchInlineSnapshot(`
    <div
      role="region"
    >
      hidden
    </div>
  `);
});
