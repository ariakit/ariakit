import { click, getByLabelText, getByRole, press } from "@ariakit/test";

test("markup", () => {
  expect(document.body).toMatchInlineSnapshot(`
    <body>
      <div>
        <label
          class="label"
        >
          <input
            aria-checked="false"
            class="checkbox"
            data-command=""
            type="checkbox"
          />
           I have read and agree to the terms and conditions
        </label>
      </div>
    </body>
  `);
});

test("check checkbox on click", async () => {
  expect(getByRole("checkbox")).not.toBeChecked();
  await click(
    getByLabelText("I have read and agree to the terms and conditions"),
  );
  expect(getByRole("checkbox")).toBeChecked();
});

test("tab", async () => {
  expect(getByRole("checkbox")).not.toHaveFocus();
  await press.Tab();
  expect(getByRole("checkbox")).toHaveFocus();
});

test("space", async () => {
  await press.Tab();
  expect(getByRole("checkbox")).toHaveFocus();
  expect(getByRole("checkbox")).not.toBeChecked();
  await press.Space();
  expect(getByRole("checkbox")).toBeChecked();
  await press.Space();
  expect(getByRole("checkbox")).not.toBeChecked();
});
