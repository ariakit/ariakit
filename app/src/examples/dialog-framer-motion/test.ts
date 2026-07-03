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
  // happy-dom reports a space-consuming scrollbar and supports
  // scrollbar-gutter, so the scroll lock lands on the html element.
  const { documentElement } = document;
  const lockStyle =
    "scrollbar-gutter: stable; overflow-x: hidden; overflow-y: hidden";
  expect(documentElement).not.toHaveStyle({ overflowY: "hidden" });
  await press.Tab();
  await press.Enter();
  expect(documentElement).toHaveStyle(lockStyle);
  expect(q.dialog()).toBeVisible();
  expect(documentElement).toHaveStyle(lockStyle);
  await press.Enter();
  expect(q.dialog()).toBeVisible();
  expect(documentElement).toHaveStyle(lockStyle);
  await expect.poll(q.dialog).not.toBeInTheDocument();
  expect(documentElement).not.toHaveStyle({ overflowY: "hidden" });
});
