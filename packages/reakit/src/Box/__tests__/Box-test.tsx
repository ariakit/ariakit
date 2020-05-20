import * as React from "react";
import { render } from "reakit-test-utils";
import { verify } from "../../../../reakit-test-utils/src/verify";
import { Box } from "../Box";

test("render", () => {
  const { getByText } = render(<Box>box</Box>);
  expect(getByText("box")).toMatchInlineSnapshot(`
    <div>
      box
    </div>
  `);
});

test("has no a11y violations", async () => {
  const { container } = render(<Box>box</Box>);
  const results = await verify(container.innerHTML);

  expect(results).toHaveNoViolations();
});
