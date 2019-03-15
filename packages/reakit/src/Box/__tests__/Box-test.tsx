import * as React from "react";
import { render } from "react-testing-library";
import { Box } from "../Box";

test("render", () => {
  const { getByText } = render(<Box>box</Box>);
  expect(getByText("box")).toMatchInlineSnapshot(`
<div>
  box
</div>
`);
});
