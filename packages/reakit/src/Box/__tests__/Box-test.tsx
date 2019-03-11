import * as React from "react";
import { render } from "react-testing-library";
import { Box } from "../Box";

test("render", () => {
  const { getByText } = render(<Box>test</Box>);
  expect(getByText("test")).toMatchInlineSnapshot(`
<div>
  test
</div>
`);
});
