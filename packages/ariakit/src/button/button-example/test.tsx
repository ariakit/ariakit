import ButtonExample from ".";
import { getByRole, render } from "ariakit-test-utils";

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
