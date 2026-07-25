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

// https://github.com/ariakit/ariakit/pull/6832#discussion_r3650306380
test("keeps the value when a descendant consumes Escape", async () => {
  await click(q.combobox.ensure("Descendant"));
  await press.ArrowDown();
  expect(q.combobox("Descendant")).toHaveTextContent("Banana");
  await click(q.button.ensure("Handles escape"));
  await press.Escape();
  expect(q.listbox()).toBeVisible();
  expect(q.combobox("Descendant")).toHaveTextContent("Banana");
});

test("still restores when the descendant is out of the event path", async () => {
  await click(q.combobox.ensure("Descendant"));
  await press.ArrowDown();
  expect(q.combobox("Descendant")).toHaveTextContent("Banana");
  await press.Escape();
  expect(q.listbox()).not.toBeInTheDocument();
  expect(q.combobox("Descendant")).toHaveTextContent("Apple");
});

test("keeps the previewed value when clicking outside after a consumed Escape", async () => {
  await click(q.combobox.ensure("Descendant"));
  await press.ArrowDown();
  expect(q.combobox("Descendant")).toHaveTextContent("Banana");
  await click(q.button.ensure("Handles escape"));
  await press.Escape();
  await click(document.body);
  expect(q.listbox()).not.toBeInTheDocument();
  expect(q.combobox("Descendant")).toHaveTextContent("Banana");
});

// https://github.com/ariakit/ariakit/pull/6832#discussion_r3650306380
test("keeps the value when a descendant stops the Escape propagation", async () => {
  await click(q.combobox.ensure("Propagation"));
  await press.ArrowDown();
  expect(q.combobox("Propagation")).toHaveTextContent("Banana");
  await click(q.button.ensure("Stops propagation"));
  await press.Escape();
  expect(q.listbox()).toBeVisible();
  expect(q.combobox("Propagation")).toHaveTextContent("Banana");
  await click(q.option("Banana"));
  expect(q.combobox("Propagation")).toHaveTextContent("Banana");
});

test("still restores when hideOnEscape prevents the default", async () => {
  await click(q.combobox.ensure("Prevented"));
  await press.ArrowDown();
  expect(q.combobox("Prevented")).toHaveTextContent("Banana");
  await press.Escape();
  expect(q.listbox()).not.toBeInTheDocument();
  expect(q.combobox("Prevented")).toHaveTextContent("Apple");
});

test("keeps the previewed value when the popover is toggled closed after a consumed Escape", async () => {
  await click(q.combobox.ensure("Descendant"));
  await press.ArrowDown();
  await click(q.button.ensure("Handles escape"));
  await press.Escape();
  await click(q.combobox.ensure("Descendant"));
  expect(q.listbox()).not.toBeInTheDocument();
  expect(q.combobox("Descendant")).toHaveTextContent("Banana");
});

// https://github.com/ariakit/ariakit/pull/6832#discussion_r3650306380
test("reports one closing Escape per keypress", async () => {
  await click(q.combobox.ensure("Counted"));
  expect(q.status("Counted counts")).toHaveTextContent("reset:0 hide:0");
  await press.Escape();
  expect(q.listbox()).not.toBeInTheDocument();
  expect(q.status("Counted counts")).toHaveTextContent("reset:1 hide:1");
});

test("reports nothing when a descendant keeps the popover open", async () => {
  await click(q.combobox.ensure("Counted"));
  await click(q.button.ensure("Swallows escape"));
  await press.Escape();
  expect(q.listbox()).toBeVisible();
  expect(q.status("Counted counts")).toHaveTextContent("reset:0 hide:0");
});

test("reports nothing when onClose vetoes the hide", async () => {
  await click(q.combobox.ensure("Vetoed"));
  await press.ArrowDown();
  expect(q.combobox("Vetoed")).toHaveTextContent("Banana");
  await press.Escape();
  expect(q.listbox()).toBeVisible();
  expect(q.combobox("Vetoed")).toHaveTextContent("Banana");
  expect(q.status("Vetoed counts")).toHaveTextContent("reset:0 hide:0");
});
