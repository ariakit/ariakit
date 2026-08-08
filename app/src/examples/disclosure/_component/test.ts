import { click, press, q } from "@ariakit/test";
import { expect, test } from "vitest";

const content = q.text.lazy(/Create an account/);

test("show/hide when clicking on disclosure", async () => {
  expect(content()).toBeVisible();
  await click(q.button("How do I get started?"));
  await expect.poll(content).not.toBeVisible();
  await click(q.button("How do I get started?"));
  expect(content()).toBeVisible();
});

test("show/hide with keyboard", async () => {
  await press.Tab();
  await press.Enter();
  await expect.poll(content).not.toBeVisible();
  await press.Enter();
  expect(content()).toBeVisible();
  await press.Space();
  await expect.poll(content).not.toBeVisible();
  await press.Space();
  expect(content()).toBeVisible();
});
