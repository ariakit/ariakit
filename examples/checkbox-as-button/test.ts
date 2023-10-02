import { click, press, q } from "@ariakit/test";

test("markup", () => {
  expect(document.body).toMatchInlineSnapshot(`
    <body>
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
    </body>
  `);
});

test("check/uncheck on click", async () => {
  expect(q.checkbox()).not.toBeChecked();
  await click(q.checkbox());
  expect(q.checkbox()).toBeChecked();
  await click(q.checkbox());
  expect(q.checkbox()).not.toBeChecked();
});

test("check/uncheck on space", async () => {
  expect(q.checkbox()).not.toBeChecked();
  await press.Tab();
  await press.Space();
  expect(q.checkbox()).toBeChecked();
  await press.Space();
  expect(q.checkbox()).not.toBeChecked();
});

test("check/uncheck on enter", async () => {
  expect(q.checkbox()).not.toBeChecked();
  await press.Tab();
  await press.Enter();
  expect(q.checkbox()).toBeChecked();
  await press.Enter();
  expect(q.checkbox()).not.toBeChecked();
});
