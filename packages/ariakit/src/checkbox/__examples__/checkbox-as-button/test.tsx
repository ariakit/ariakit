import { click, getByRole, render } from "ariakit-test-utils";
import { axe } from "jest-axe";
import Example from ".";

test("a11y", async () => {
  render(<Example />);
  expect(await axe(getByRole("checkbox"))).toHaveNoViolations();
});

test("render checkbox as button", async () => {
  const { container } = render(<Example />);
  expect(container).toMatchInlineSnapshot(`
    <div>
      <label
        class="label"
      >
        <button
          aria-checked="false"
          class="checkbox"
          data-command=""
          role="checkbox"
        >
          <span
            style="border: 0px; height: 1px; margin: -1px; overflow: hidden; padding: 0px; position: absolute; white-space: nowrap; width: 1px;"
          >
            checkbox
          </span>
        </button>
        I have read and agree to the terms and conditions
      </label>
    </div>
  `);
});

test("change controlled state", async () => {
  render(<Example />);
  expect(getByRole("checkbox")).not.toBeChecked();
  await click(getByRole("checkbox"));
  expect(getByRole("checkbox")).toBeChecked();
});
