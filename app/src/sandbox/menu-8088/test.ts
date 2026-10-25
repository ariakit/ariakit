import { click, q } from "@ariakit/test";
import { expect, test } from "vitest";

// Menu buttons that share a store and receive inline ref callbacks re-attach
// their refs when the owner re-renders on open. The button that opened the menu
// must keep it. Browser duplicate in test-chrome.ts.
// https://github.com/ariakit/ariakit/issues/8088
test("keeps the menu on the second button when it opens the menu", async () => {
  const formatting = q.button("Formatting");
  const quickFormat = q.button("Quick format");

  await click(quickFormat);

  expect(q.text("Menu: open")).toBeInTheDocument();
  expect(q.menu("Quick format")).toBeVisible();
  expect(quickFormat).toHaveAttribute("aria-expanded", "true");
  expect(formatting).toHaveAttribute("aria-expanded", "false");
});

// https://github.com/ariakit/ariakit/issues/8088
test("moves the menu to the button that opens it again", async () => {
  const formatting = q.button("Formatting");
  const quickFormat = q.button("Quick format");

  await click(formatting);
  expect(q.menu("Formatting")).toBeVisible();
  await click(formatting);
  expect(q.text("Menu: closed")).toBeInTheDocument();

  await click(quickFormat);

  expect(q.menu("Quick format")).toBeVisible();
  expect(quickFormat).toHaveAttribute("aria-expanded", "true");
  expect(formatting).toHaveAttribute("aria-expanded", "false");

  await click(quickFormat);
  expect(q.text("Menu: closed")).toBeInTheDocument();

  await click(formatting);

  expect(q.menu("Formatting")).toBeVisible();
  expect(formatting).toHaveAttribute("aria-expanded", "true");
  expect(quickFormat).toHaveAttribute("aria-expanded", "false");
});
