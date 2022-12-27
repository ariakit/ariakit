import { getByRole, render } from "@ariakit/test";
import Example from ".";

test("markup", () => {
  render(<Example />);
  expect(getByRole("button")).toMatchInlineSnapshot(`
    <div
      class="button"
      data-command=""
      role="button"
      tabindex="0"
    >
      Button
    </div>
  `);
});
