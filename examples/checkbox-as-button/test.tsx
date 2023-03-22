import { click, getByRole, press, render } from "@ariakit/test";
import Example from ".";

test("markup", async () => {
  const { container } = render(<Example />);
  expect(container).toMatchInlineSnapshot(`
    <div>
      <button
        aria-checked="false"
        class="button"
        data-command=""
        role="checkbox"
      >
        Unchecked
      </button>
    </div>
  `);
});

test("check/uncheck on click", async () => {
  render(<Example />);
  expect(getByRole("checkbox")).not.toBeChecked();
  await click(getByRole("checkbox"));
  expect(getByRole("checkbox")).toBeChecked();
  await click(getByRole("checkbox"));
  expect(getByRole("checkbox")).not.toBeChecked();
});

test("check/uncheck on space", async () => {
  render(<Example />);
  expect(getByRole("checkbox")).not.toBeChecked();
  await press.Tab();
  await press.Space();
  expect(getByRole("checkbox")).toBeChecked();
  await press.Space();
  expect(getByRole("checkbox")).not.toBeChecked();
});

test("check/uncheck on enter", async () => {
  render(<Example />);
  expect(getByRole("checkbox")).not.toBeChecked();
  await press.Tab();
  await press.Enter();
  expect(getByRole("checkbox")).toBeChecked();
  await press.Enter();
  expect(getByRole("checkbox")).not.toBeChecked();
});
