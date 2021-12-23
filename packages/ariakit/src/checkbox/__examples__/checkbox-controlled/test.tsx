import { click, getByRole, render } from "ariakit-test-utils";
import Example from ".";

test("render checkbox", async () => {
  const { container } = render(<Example />);
  expect(container).toMatchInlineSnapshot(`
    <div>
      <label
        class="label"
      >
        <input
          aria-checked="true"
          checked=""
          class="checkbox"
          data-command=""
          type="checkbox"
        />
        I have read and agree to the terms and conditions
      </label>
    </div>
  `);
});

test("change controlled state", async () => {
  render(<Example />);
  expect(getByRole("checkbox")).toBeChecked();
  await click(getByRole("checkbox"));
  expect(getByRole("checkbox")).not.toBeChecked();
});
