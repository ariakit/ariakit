import * as React from "react";
import { render, axe } from "reakit-test-utils";
import { Box } from "../Box";

test("render", () => {
  const { getByText } = render(<Box>box</Box>);
  expect(getByText("box")).toMatchInlineSnapshot(`
    <div>
      box
    </div>
  `);
});

test("render with no a11y violations", async () => {
  const { container } = render(<Box>box</Box>);
  const results = await axe(container.innerHTML);

  expect(results).toHaveNoViolations();
});
