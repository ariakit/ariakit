import * as React from "react";
import { render } from "react-testing-library";
import { Button } from "../Button";

test("render", () => {
  const { getByText } = render(<Button>button</Button>);
  expect(getByText("button")).toMatchInlineSnapshot(`
<button
  role="button"
  tabindex="0"
  type="button"
>
  button
</button>
`);
});
