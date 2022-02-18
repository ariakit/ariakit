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
      <button
        aria-checked="false"
        class="checkbox"
        data-command=""
        role="checkbox"
      >
        Unchecked
      </button>
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
test("check and uncheck checkbox by with keyboard (enter)", async () => {
  render(<Example />);
  expect(getByRole("checkbox")).not.toBeChecked();
  await press.Tab();
  await press.Enter();
  expect(getByRole("checkbox")).toBeChecked();
  await press.Enter();
  expect(getByRole("checkbox")).not.toBeChecked();
});
