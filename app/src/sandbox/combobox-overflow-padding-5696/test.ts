// See https://github.com/ariakit/ariakit/issues/5696
import { click, press, q } from "@ariakit/test";
import { expect, test } from "vitest";

function expectOverflowPadding(popover: HTMLElement, value = "32px") {
  const wrapper = popover.parentElement;
  expect(wrapper).not.toBeNull();
  if (!wrapper) return;
  // Popover exposes positioning styles on the element's wrapper.
  expect(
    getComputedStyle(wrapper).getPropertyValue("--popover-overflow-padding"),
  ).toBe(value);
}

// The overflow padding variable is public API and must be exposed on the
// wrapper even while the popover is closed and hidden, before it first opens.
test("exposes the overflow padding variable on a closed popover", () => {
  const popover = document.querySelector<HTMLElement>(".closed-popover");
  expect(popover).not.toBeNull();
  if (!popover) return;
  expect(popover).not.toBeVisible();
  expectOverflowPadding(popover, "24px");
});

test("uses the greatest horizontal overflow padding for CSS sizing", async () => {
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

test("does not reposition when inline padding values are unchanged", async () => {
  const popover = q.listbox.ensure();
  const positionUpdates = q.status.ensure("Position updates");
  const initialPositionUpdates = positionUpdates.textContent;
  expect(Number(initialPositionUpdates)).toBeGreaterThan(0);

  await click(q.button("Rerender"));

  expect(popover).toBeVisible();
  expect(positionUpdates.textContent).toBe(initialPositionUpdates);
});

test("repositions when an inline padding value changes", async () => {
  const popover = q.listbox.ensure();
  const positionUpdates = q.status.ensure("Position updates");
  const initialPositionUpdates = positionUpdates.textContent;
  expect(Number(initialPositionUpdates)).toBeGreaterThan(0);

  await click(q.button("Change padding"));

  expect(popover).toBeVisible();
  expect(positionUpdates.textContent).not.toBe(initialPositionUpdates);
  expectOverflowPadding(popover, "40px");
});
