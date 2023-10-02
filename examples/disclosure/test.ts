import { click, press, q } from "@ariakit/test";

test("show/hide on click", async () => {
  expect(q.text(/Vegetables are parts/)).not.toBeVisible();
  expect(q.button()).toHaveAttribute("aria-expanded", "false");
  await click(q.button());
  expect(q.text(/Vegetables are parts/)).toBeVisible();
  expect(q.button()).toHaveAttribute("aria-expanded", "true");
  await click(q.button());
  expect(q.text(/Vegetables are parts/)).not.toBeVisible();
  expect(q.button()).toHaveAttribute("aria-expanded", "false");
});

test("show/hide on enter", async () => {
  expect(q.text(/Vegetables are parts/)).not.toBeVisible();
  await press.Tab();
  await press.Enter();
  expect(q.text(/Vegetables are parts/)).toBeVisible();
  await press.Enter();
  expect(q.text(/Vegetables are parts/)).not.toBeVisible();
});

test("show/hide on space", async () => {
  expect(q.text(/Vegetables are parts/)).not.toBeVisible();
  await press.Tab();
  await press.Space();
  expect(q.text(/Vegetables are parts/)).toBeVisible();
  await press.Space();
  expect(q.text(/Vegetables are parts/)).not.toBeVisible();
});
