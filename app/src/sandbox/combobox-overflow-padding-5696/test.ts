// See https://github.com/ariakit/ariakit/issues/5696
import { click, press, q } from "@ariakit/test";
import { expect, test } from "vitest";

function expectOverflowPadding(popover: HTMLElement) {
  const wrapper = popover.parentElement;
  expect(wrapper).not.toBeNull();
  if (!wrapper) return;
  // Popover exposes positioning styles on the element's wrapper.
  expect(
    getComputedStyle(wrapper).getPropertyValue("--popover-overflow-padding"),
  ).toBe("32px");
}

test("supports object overflow padding in CSS sizing", async () => {
  const popover = q.listbox.ensure();
  expectOverflowPadding(popover);

  const combobox = q.combobox("Favorite fruit");
  await click(combobox);
  await press.Escape();
  expect(popover).not.toBeVisible();
  await click(combobox);
  expect(popover).toBeVisible();
  expectOverflowPadding(popover);
});
