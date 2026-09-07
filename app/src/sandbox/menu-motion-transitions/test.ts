// @vitest-environment jsdom
// TODO: Remove this jsdom override once happy-dom fixes Animation.cancel()
// rejections and this file passes without unhandled errors. Until then,
// jsdom keeps Motion on its JavaScript animation path.
// https://github.com/capricorn86/happy-dom/issues/2339
import { click, press, q } from "@ariakit/test";
import { expect, test } from "vitest";

test("show/hide on click", async () => {
  expect(q.menu.maybe()).not.toBeInTheDocument();
  await click(q.button("Options"));
  expect(q.menu()).toBeVisible();
  expect(q.menu()).toHaveFocus();
  await click(q.button("Options"));
  expect(q.button("Options")).toHaveFocus();
  expect(q.menu.hidden()).toBeVisible();
  await expect.poll(q.menu.maybe.lazy()).not.toBeInTheDocument();
});

test("show/hide on enter", async () => {
  expect(q.menu.maybe()).not.toBeInTheDocument();
  await press.Tab();
  await press.Enter();
  expect(q.menu()).toBeVisible();
  expect(q.menuitem("Edit")).toHaveFocus();
  await press.ShiftTab();
  await press.Enter();
  expect(q.button("Options")).toHaveFocus();
  expect(q.menu()).toBeVisible();
  await expect.poll(q.menu.maybe.lazy()).not.toBeInTheDocument();
});

test("show/hide on space", { retry: 2 }, async () => {
  expect(q.menu.maybe()).not.toBeInTheDocument();
  await press.Tab();
  await press.Space();
  expect(q.menu()).toBeVisible();
  expect(q.menuitem("Edit")).toHaveFocus();
  await press.ShiftTab();
  await press.Space();
  expect(q.button("Options")).toHaveFocus();
  expect(q.menu.hidden()).toBeVisible();
  await expect.poll(q.menu.maybe.lazy()).not.toBeInTheDocument();
});

test("hide on esc", async () => {
  expect(q.menu.maybe()).not.toBeInTheDocument();
  await click(q.button("Options"));
  await press.Escape();
  expect(q.button("Options")).toHaveFocus();
  expect(q.menu()).toBeVisible();
  await expect.poll(q.menu.maybe.lazy()).not.toBeInTheDocument();
});

test("hide on click outside", async () => {
  expect(q.menu.maybe()).not.toBeInTheDocument();
  await click(q.button("Options"));
  await click(document.body);
  expect(q.button("Options")).not.toHaveFocus();
  expect(q.menu.hidden()).toBeVisible();
  await expect.poll(q.menu.maybe.lazy()).not.toBeInTheDocument();
});
