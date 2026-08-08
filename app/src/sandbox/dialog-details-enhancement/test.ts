import { click, press, q } from "@ariakit/test";
import { expect, test } from "vitest";

test("show on disclosure click", async () => {
  expect(q.dialog()).not.toBeInTheDocument();
  await click(q.button("Show modal"));
  expect(q.dialog()).toBeVisible();
  expect(q.button("OK")).toHaveFocus();
});

test("show on disclosure enter", async () => {
  expect(q.dialog()).not.toBeInTheDocument();
  await press.Tab();
  await press.Enter();
  expect(q.dialog()).toBeVisible();
  expect(q.button("OK")).toHaveFocus();
});

test("show on disclosure space", async () => {
  expect(q.dialog()).not.toBeInTheDocument();
  await press.Tab();
  await press.Space();
  expect(q.dialog()).toBeVisible();
  expect(q.button("OK")).toHaveFocus();
});

test("keeps focus away from the disclosure while open", async () => {
  const disclosure = q.button("Show modal");
  for (const pressTab of [press.Tab, press.ShiftTab]) {
    await click(disclosure);
    expect(q.button("OK")).toHaveFocus();
    await pressTab();
    expect(q.dialog()).toBeVisible();
    await expect.poll(q.button.lazy("OK")).toHaveFocus();
    await press.Escape();
  }
});

test("hide on escape", async () => {
  await click(q.button("Show modal"));
  expect(q.dialog()).toBeVisible();
  await press.Escape();
  expect(q.dialog()).not.toBeInTheDocument();
  expect(q.button("Show modal")).toHaveFocus();
});

test("hide on click outside", async () => {
  await click(q.button("Show modal"));
  expect(q.dialog()).toBeVisible();
  await click(document.body);
  expect(q.dialog()).not.toBeInTheDocument();
  expect(q.button("Show modal")).not.toHaveFocus();
});

test("hide on dismiss button click", async () => {
  await click(q.button("Show modal"));
  expect(q.dialog()).toBeVisible();
  await click(q.button("OK"));
  expect(q.dialog()).not.toBeInTheDocument();
  expect(q.button("Show modal")).toHaveFocus();
});

test("hide on dismiss button enter", async () => {
  await click(q.button("Show modal"));
  expect(q.dialog()).toBeVisible();
  await press.Enter();
  expect(q.dialog()).not.toBeInTheDocument();
  expect(q.button("Show modal")).toHaveFocus();
});

test("hide on dismiss button space", async () => {
  await click(q.button("Show modal"));
  expect(q.dialog()).toBeVisible();
  await press.Space();
  expect(q.dialog()).not.toBeInTheDocument();
  expect(q.button("Show modal")).toHaveFocus();
});
