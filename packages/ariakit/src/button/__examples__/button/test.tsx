import { getByRole, render } from "ariakit-test-utils";
import Example from ".";

test("render button", () => {
  render(<Example />);
  expect(getByRole("button")).toMatchInlineSnapshot(`
    <button
      class="button"
      data-command=""
      type="button"
    >
      Button
    </button>
  `);
});
