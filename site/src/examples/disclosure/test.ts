import { click, press, q } from "@ariakit/test";

const content = () => q.text(/Create an account/);

test("show/hide on click", async () => {
  expect(content()).toBeVisible();
  expect(q.button()).toHaveAttribute("aria-expanded", "true");
  await click(q.button());
  expect(content()).not.toBeVisible();
  expect(q.button()).toHaveAttribute("aria-expanded", "false");
});

test("show/hide on enter", async () => {
  expect(content()).toBeVisible();
  await press.Tab();
  await press.Enter();
  expect(content()).not.toBeVisible();
  await press.Enter();
  expect(content()).toBeVisible();
});

test("show/hide on space", async () => {
  expect(content()).toBeVisible();
  await press.Tab();
  await press.Space();
  expect(content()).not.toBeVisible();
  await press.Space();
  expect(content()).toBeVisible();
});
