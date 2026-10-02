import { click, focus, hover, press, q } from "@ariakit/test";
import { expect, test } from "vitest";

async function pressEscapeOnce(label: string) {
  const closeRequests = q.text(new RegExp(`^${label} close requests: `));
  expect(closeRequests).toHaveTextContent(`${label} close requests: 0`);
  await press.Escape();
  expect(closeRequests).toHaveTextContent(`${label} close requests: 1`);
}

// https://github.com/ariakit/ariakit/issues/7622
test("Escape requests one close in Menu", async () => {
  await click(q.button("Actions"));
  expect(q.menu("Actions")).toBeVisible();
  await pressEscapeOnce("Actions");
  expect(q.menu("Actions")).toBeVisible();
});

// https://github.com/ariakit/ariakit/issues/7622
test("Escape requests one close in Hovercard", async () => {
  await hover(q.link("@ariakit"));
  await expect.poll(q.dialog.lazy("Ariakit profile")).toBeVisible();
  await pressEscapeOnce("Profile");
  expect(q.dialog("Ariakit profile")).toBeVisible();
});

// https://github.com/ariakit/ariakit/issues/7622
test("Escape requests one close in Tooltip", async () => {
  await focus(q.button("Bold"));
  expect(await q.tooltip.wait("Make the text bold")).toBeVisible();
  await pressEscapeOnce("Bold");
  expect(q.tooltip("Make the text bold")).toBeVisible();
});

// https://github.com/ariakit/ariakit/issues/7623
test("Escape requests one close in ComboboxSelect", async () => {
  await click(q.combobox("Fruit"));
  await press.ArrowDown();
  expect(q.option("Banana")).toHaveAttribute("data-active-item");
  await pressEscapeOnce("Fruit");
  expect(q.listbox("Fruit")).toBeVisible();
});

// https://github.com/ariakit/ariakit/issues/7623
test("Escape requests one close in Select", async () => {
  await click(q.combobox("Dessert"));
  await press.ArrowDown();
  expect(q.option("Banana")).toHaveAttribute("data-active-item");
  await pressEscapeOnce("Dessert");
  expect(q.listbox("Dessert")).toBeVisible();
});

// https://github.com/ariakit/ariakit/issues/7623
test("Escape requests one close in Combobox with an active item", async () => {
  await focus(q.combobox("Snack"));
  await press.ArrowDown();
  await press.ArrowDown();
  expect(q.option("Apple")).toHaveAttribute("data-active-item");
  await pressEscapeOnce("Snack");
  expect(q.listbox("Snack")).toBeVisible();
});

// https://github.com/ariakit/ariakit/issues/7623
test("Escape requests one close in ComboboxSelect with ComboboxInput", async () => {
  await click(q.combobox("Smoothie"));
  expect(q.combobox("Search fruits")).toHaveFocus();
  await press.ArrowDown();
  expect(q.option("Banana")).toHaveAttribute("data-active-item");
  await pressEscapeOnce("Smoothie");
  expect(q.listbox()).toBeVisible();
});

// https://github.com/ariakit/ariakit/issues/7622
// https://github.com/ariakit/ariakit/issues/7623
test("Escape requests one close in Menu with Combobox", async () => {
  await click(q.button("Add block"));
  expect(q.combobox("Search blocks")).toHaveFocus();
  await press.ArrowDown();
  expect(q.option("Paragraph")).toHaveAttribute("data-active-item");
  await pressEscapeOnce("Add block");
  // A menu with a combobox has the dialog role.
  expect(q.dialog("Add block")).toBeVisible();
});
