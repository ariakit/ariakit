import * as React from "react";
import { render } from "reakit-test-utils";
import { DisclosureRegion } from "../DisclosureRegion";

test("render", () => {
  const { getByText } = render(
    <DisclosureRegion id="base">content</DisclosureRegion>
  );
  expect(getByText("content")).toMatchInlineSnapshot(`
    <div
      class="hidden"
      hidden=""
      id="base"
      role="region"
      style="display: none;"
    >
      content
    </div>
  `);
});

test("render visible", () => {
  const { getByText } = render(
    <DisclosureRegion id="base" visible>
      content
    </DisclosureRegion>
  );
  expect(getByText("content")).toMatchInlineSnapshot(`
    <div
      id="base"
      role="region"
    >
      content
    </div>
  `);
});
