import { click, press, q } from "@ariakit/test";
import { expect, test } from "vitest";

test("show/hide on click", async () => {
  expect(q.dialog()).not.toBeInTheDocument();
  await click(q.button("Show modal"));
  expect(q.dialog()).toBeVisible();
  expect(q.button("OK")).toHaveFocus();
  await click(q.button("OK"));
  expect(q.dialog()).toBeVisible();
  expect(q.button("Show modal")).toHaveFocus();
  await expect.poll(q.dialog).not.toBeInTheDocument();
  expect(q.button("Show modal")).toHaveFocus();
});

test("prevent body scroll", async () => {
  const { documentElement, body } = document;
  const expectScrollLocked = (locked: boolean) => {
    const htmlLocked =
      documentElement.style.overflowX === "hidden" &&
      documentElement.style.overflowY === "hidden";
    const bodyLocked = body.style.overflow === "hidden";
    expect(htmlLocked || bodyLocked).toBe(locked);
  };
  expectScrollLocked(false);
  await press.Tab();
  await press.Enter();
  expectScrollLocked(true);
  expect(q.dialog()).toBeVisible();
  expectScrollLocked(true);
  await press.Enter();
  expect(q.dialog()).toBeVisible();
  expectScrollLocked(true);
  await expect.poll(q.dialog).not.toBeInTheDocument();
  expectScrollLocked(false);
});
