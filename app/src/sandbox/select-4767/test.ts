import { click, press, q } from "@ariakit/test";
import { expect, test, vi } from "vitest";

const virtualFocusWarning =
  "A composite widget with `virtualFocus` enabled requires a focusable " +
  "composite element. Set the `focusable` prop to `true` or the " +
  "`virtualFocus` option to `false`.";

// https://github.com/ariakit/ariakit/issues/4767
test("clears focus-visible when the virtual focus owner isn't focusable", async () => {
  using consoleWarn = vi.spyOn(console, "warn").mockImplementation(() => {});
  await click(q.combobox("Favorite fruit"));
  const apple = q.option("Apple");
  expect(document.activeElement).toBe(apple);

  await press.ArrowDown();
  const banana = q.option("Banana");
  expect(document.activeElement).toBe(banana);
  expect(banana).toHaveAttribute("data-focus-visible", "true");

  await press.ArrowDown();

  const orange = q.option("Orange");
  expect(document.activeElement).toBe(orange);
  expect(orange).toHaveAttribute("data-focus-visible", "true");
  expect(apple).not.toHaveAttribute("data-focus-visible");
  expect(banana).not.toHaveAttribute("data-focus-visible");
  expect(consoleWarn).toHaveBeenCalledTimes(1);
  expect(consoleWarn).toHaveBeenCalledWith(virtualFocusWarning);
});

test("preserves virtual focus with a focusable owner", async () => {
  using consoleWarn = vi.spyOn(console, "warn").mockImplementation(() => {});
  await click(q.combobox("Virtual focus fruit"));
  const listbox = q.listbox();
  expect(document.activeElement).toBe(listbox);

  await press.ArrowDown();
  const banana = q.option("Banana");
  expect(document.activeElement).toBe(listbox);
  expect(banana?.id).toBeTruthy();
  expect(listbox?.getAttribute("aria-activedescendant")).toBe(banana?.id);
  expect(banana).toHaveAttribute("data-focus-visible", "true");

  await press.ArrowDown();
  const orange = q.option("Orange");
  expect(document.activeElement).toBe(listbox);
  expect(orange?.id).toBeTruthy();
  expect(listbox?.getAttribute("aria-activedescendant")).toBe(orange?.id);
  expect(orange).toHaveAttribute("data-focus-visible", "true");
  expect(banana).not.toHaveAttribute("data-focus-visible");
  expect(consoleWarn).not.toHaveBeenCalled();
});

test("preserves real focus with a non-focusable owner", async () => {
  using consoleWarn = vi.spyOn(console, "warn").mockImplementation(() => {});
  await click(q.combobox("Real focus fruit"));
  const apple = q.option("Apple");
  expect(document.activeElement).toBe(apple);

  await press.ArrowDown();
  const banana = q.option("Banana");
  expect(document.activeElement).toBe(banana);
  expect(banana).toHaveAttribute("data-focus-visible", "true");

  await press.ArrowDown();
  const orange = q.option("Orange");
  expect(document.activeElement).toBe(orange);
  expect(orange).toHaveAttribute("data-focus-visible", "true");
  expect(apple).not.toHaveAttribute("data-focus-visible");
  expect(banana).not.toHaveAttribute("data-focus-visible");
  expect(consoleWarn).not.toHaveBeenCalled();
});
