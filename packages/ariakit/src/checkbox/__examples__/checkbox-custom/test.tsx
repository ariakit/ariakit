import { click, getByRole, press, render } from "ariakit-test-utils";
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
        <span
          style="border: 0px; height: 1px; margin: -1px; overflow: hidden; padding: 0px; position: absolute; white-space: nowrap; width: 1px;"
        >
          <input
            aria-checked="false"
            data-command=""
            type="checkbox"
          />
        </span>
        <div
          class="checkbox"
          data-checked="false"
        >
          <span
            aria-hidden="true"
            style="width: 1em; height: 1em; pointer-events: none;"
          />
        </div>
        I have read and agree to the terms and conditions
      </label>
    </div>
  `);
});

test("check and uncheck checkbox by clicking", async () => {
  render(<Example />);
  expect(getByRole("checkbox")).not.toBeChecked();
  await click(getByRole("checkbox"));
  expect(getByRole("checkbox")).toBeChecked();
  await click(getByRole("checkbox"));
  expect(getByRole("checkbox")).not.toBeChecked();
});

test("check and uncheck checkbox by with keyboard (space)", async () => {
  render(<Example />);
  expect(getByRole("checkbox")).not.toBeChecked();
  await press.Tab();
  await press.Space();
  expect(getByRole("checkbox")).toBeChecked();
  await press.Space();
  expect(getByRole("checkbox")).not.toBeChecked();
});
