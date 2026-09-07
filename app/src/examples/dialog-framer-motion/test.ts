// @vitest-environment jsdom
// TODO: Remove this jsdom override once happy-dom applies animated styles
// and fixes Animation.cancel() rejections. Until then, jsdom keeps Motion
// on its JavaScript animation path.
// https://github.com/capricorn86/happy-dom/pull/2335
// https://github.com/capricorn86/happy-dom/issues/2339
import { click, press, q } from "@ariakit/test";
import { expect, test } from "vitest";

test("show/hide on click", async () => {
  expect(q.dialog.maybe()).not.toBeInTheDocument();
  await click(q.button("Show modal"));
  expect(q.dialog()).toBeVisible();
  expect(q.button("OK")).toHaveFocus();
  await click(q.button("OK"));
  expect(q.dialog()).toBeVisible();
  expect(q.button("Show modal")).toHaveFocus();
  await expect.poll(q.dialog.maybe.lazy()).not.toBeInTheDocument();
  expect(q.button("Show modal")).toHaveFocus();
});

test("prevent body scroll", async () => {
  // jsdom reports a space-consuming scrollbar and supports scrollbar-gutter, so
  // the scroll lock lands on the html element.
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
  await expect.poll(q.dialog.maybe.lazy()).not.toBeInTheDocument();
  expect(documentElement).not.toHaveStyle({ overflowY: "hidden" });
});
