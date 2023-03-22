import { getByRole, render } from "@ariakit/test";
import Example from "./index.js";

test("markup", () => {
  render(<Example />);
  expect(getByRole("link")).toMatchInlineSnapshot(`
    <a
      class="button"
      data-command=""
      href="#"
    >
      Button
    </a>
  `);
});
