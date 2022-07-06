import { getByRole, render } from "ariakit-test";
import { axe } from "jest-axe";
import Example from ".";

test("a11y", async () => {
  render(<Example />);
  expect(await axe(getByRole("link"))).toHaveNoViolations();
});

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
