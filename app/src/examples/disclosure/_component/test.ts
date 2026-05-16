import { click, press, q } from "@ariakit/test";
import { expect, test } from "vitest";

test("show/hide when clicking on disclosure", async () => {
  expect(q.text(/Create an account/)).toBeVisible();
  await click(q.button("How do I get started?"));
  expect(q.text(/Create an account/)).not.toBeVisible();
  await click(q.button("How do I get started?"));
  expect(q.text(/Create an account/)).toBeVisible();
});

test("show/hide with keyboard", async () => {
  await press.Tab();
  await press.Enter();
  expect(q.text(/Create an account/)).not.toBeVisible();
  await press.Enter();
  expect(q.text(/Create an account/)).toBeVisible();
  await press.Space();
  expect(q.text(/Create an account/)).not.toBeVisible();
  await press.Space();
  expect(q.text(/Create an account/)).toBeVisible();
});
