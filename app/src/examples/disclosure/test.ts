import { click, press, q } from "@ariakit/test";
import { expect, test } from "vitest";

const content = () => q.text(/Create an account/);

test("show/hide on click", async () => {
  expect(content()).toBeVisible();
  expect(q.button()).toHaveAttribute("aria-expanded", "true");
  await click(q.button());
  await expect.poll(content).not.toBeVisible();
  expect(q.button()).toHaveAttribute("aria-expanded", "false");
});

test("show/hide on enter", async () => {
  expect(content()).toBeVisible();
  await press.Tab();
  await press.Enter();
  await expect.poll(content).not.toBeVisible();
  expect(q.button()).toHaveFocus();
  await press.Enter();
  await expect.poll(content).toBeVisible();
});

test("show/hide on space", async () => {
  expect(content()).toBeVisible();
  await press.Tab();
  await press.Space();
  await expect.poll(content).not.toBeVisible();
  await press.Space();
  await expect.poll(content).toBeVisible();
});
