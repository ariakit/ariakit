import { getByRole, render } from "ariakit-test-utils";
import ButtonExample from ".";

test("render button", () => {
  render(<ButtonExample />);
  expect(getByRole("button")).toMatchInlineSnapshot(`
<button
  data-command=""
  type="button"
>
  Button
</button>
`);
});
