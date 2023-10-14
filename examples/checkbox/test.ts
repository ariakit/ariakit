import { click, press, q } from "@ariakit/test";

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
            type="checkbox"
          />
           I have read and agree to the terms and conditions
        </label>
      </div>
    </body>
  `);
});

test("check checkbox on click", async () => {
  expect(q.checkbox()).not.toBeChecked();
  await click(q.labeled("I have read and agree to the terms and conditions"));
  expect(q.checkbox()).toBeChecked();
});

test("tab", async () => {
  expect(q.checkbox()).not.toHaveFocus();
  await press.Tab();
  expect(q.checkbox()).toHaveFocus();
});

test("space", async () => {
  await press.Tab();
  expect(q.checkbox()).toHaveFocus();
  expect(q.checkbox()).not.toBeChecked();
  await press.Space();
  expect(q.checkbox()).toBeChecked();
  await press.Space();
  expect(q.checkbox()).not.toBeChecked();
});
