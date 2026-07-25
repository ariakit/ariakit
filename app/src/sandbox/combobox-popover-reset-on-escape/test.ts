import { click, hover, press, q } from "@ariakit/test";
import { expect, test } from "vitest";

// https://github.com/ariakit/ariakit/pull/6832#discussion_r3649285785
test("restores the value from before the popover was shown", async () => {
  await click(q.combobox.ensure("Mounted"));
  await press.ArrowDown();
  expect(q.combobox("Mounted")).toHaveTextContent("Banana");
  await press.Escape();
  expect(q.combobox("Mounted")).toHaveTextContent("Apple");
});

test("restores the previous value with unmountOnHide", async () => {
  await click(q.combobox.ensure("Unmounted"));
  await press.ArrowDown();
  expect(q.combobox("Unmounted")).toHaveTextContent("Banana");
  await press.Escape();
  expect(q.combobox("Unmounted")).toHaveTextContent("Apple");
});

test("honors a resetOnEscape callback", async () => {
  await click(q.combobox.ensure("Callback"));
  await press.ArrowDown();
  expect(q.combobox("Callback")).toHaveTextContent("Banana");
  await press.Escape();
  expect(q.combobox("Callback")).toHaveTextContent("Banana");
});

test("restores after the active item is cleared by hovering out", async () => {
  await click(q.combobox.ensure("Mounted"));
  await press.ArrowDown();
  expect(q.combobox("Mounted")).toHaveTextContent("Banana");
  await hover(q.option("Banana"));
  await hover(document.body);
  expect(q.combobox("Mounted")).not.toHaveAttribute("aria-activedescendant");
  await press.Escape();
  expect(q.combobox("Mounted")).toHaveTextContent("Apple");
});
