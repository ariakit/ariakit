import * as React from "react";
import { render } from "@testing-library/react";
import { Hidden } from "../Hidden";

test("render", () => {
  const { getByText } = render(<Hidden id="base">hidden</Hidden>);
  expect(getByText("hidden")).toMatchInlineSnapshot(`
    <div
      class="hidden"
      hidden=""
      id="base"
      role="region"
      style="display: none;"
    >
      hidden
    </div>
  `);
});

test("render visible", () => {
  const { getByText } = render(
    <Hidden id="base" visible>
      hidden
    </Hidden>
  );
  expect(getByText("hidden")).toMatchInlineSnapshot(`
    <div
      id="base"
      role="region"
    >
      hidden
    </div>
  `);
});
