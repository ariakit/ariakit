import { getByRole, render } from "@ariakit/test";
import Example from "./index.jsx";

test("markup", () => {
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
