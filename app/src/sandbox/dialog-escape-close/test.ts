import { click, focus, hover, press, q, type } from "@ariakit/test";
import { expect, test } from "vitest";

function queryShadowRoot(name: string) {
  const host = document.querySelector(`[data-shadow-host="${name}"]`);
  return q.within(
    host?.shadowRoot?.querySelector<HTMLElement>("[data-shadow-container]"),
  );
}

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

// https://github.com/ariakit/ariakit/issues/7647
test("Escape closes the Combobox popover before a Dialog outside its tree", async () => {
  await click(q.button("Open notice"));
  expect(q.dialog("Notice")).toBeVisible();
  await focus(q.combobox("Drink"));
  await press.ArrowDown();
  expect(q.listbox("Drink")).toBeVisible();
  expect(q.option("Apple")).not.toHaveAttribute("data-active-item");
  await press.Escape();
  expect(q.listbox.maybe("Drink")).not.toBeInTheDocument();
  expect(q.dialog("Notice")).toBeVisible();
  expect(q.combobox("Drink")).toHaveFocus();
  // The dialog is the topmost popup again, so the next Escape closes it.
  await press.Escape();
  expect(q.dialog.maybe("Notice")).not.toBeInTheDocument();
});

// https://github.com/ariakit/ariakit/issues/7647
test("Escape closes the Combobox popover with an active item before a Dialog outside its tree", async () => {
  await click(q.button("Open notice"));
  expect(q.dialog("Notice")).toBeVisible();
  await focus(q.combobox("Drink"));
  await press.ArrowDown();
  await press.ArrowDown();
  expect(q.option("Apple")).toHaveAttribute("data-active-item");
  await press.Escape();
  expect(q.listbox.maybe("Drink")).not.toBeInTheDocument();
  expect(q.dialog("Notice")).toBeVisible();
  expect(q.combobox("Drink")).toHaveFocus();
  // The dialog is the topmost popup again, so the next Escape closes it.
  await press.Escape();
  expect(q.dialog.maybe("Notice")).not.toBeInTheDocument();
});

// https://github.com/ariakit/ariakit/issues/7647
test("Escape closes the Combobox popover before the Tooltip of its input", async () => {
  await focus(q.combobox("Garnish"));
  expect(await q.tooltip.wait("Search garnishes")).toBeVisible();
  await press.ArrowDown();
  expect(q.listbox("Garnish")).toBeVisible();
  await press.Escape();
  expect(q.listbox.maybe("Garnish")).not.toBeInTheDocument();
  expect(q.tooltip("Search garnishes")).toBeVisible();
  expect(q.combobox("Garnish")).toHaveFocus();
  // The tooltip is the topmost popup again, so the next Escape closes it.
  await press.Escape();
  expect(q.tooltip.maybe("Search garnishes")).not.toBeInTheDocument();
});

// https://github.com/ariakit/ariakit/issues/7647
test("Escape closes the Tooltip that opened after the Combobox popover of its anchor", async () => {
  await focus(q.combobox("Garnish"));
  expect(await q.tooltip.wait("Search garnishes")).toBeVisible();
  // The tooltip is the only open popup, so Escape closes it.
  await press.Escape();
  expect(q.tooltip.maybe("Search garnishes")).not.toBeInTheDocument();
  await press.ArrowDown();
  expect(q.listbox("Garnish")).toBeVisible();
  // The listbox is open, so the tooltip opens last this time.
  await hover(q.combobox("Garnish"));
  expect(await q.tooltip.wait("Search garnishes")).toBeVisible();
  await press.Escape();
  expect(q.tooltip.maybe("Search garnishes")).not.toBeInTheDocument();
  expect(q.listbox("Garnish")).toBeVisible();
  expect(q.combobox("Garnish")).toHaveFocus();
  // The listbox is the topmost popup again, so the next Escape closes it.
  await press.Escape();
  expect(q.listbox.maybe("Garnish")).not.toBeInTheDocument();
});

// https://github.com/ariakit/ariakit/issues/7647
test("Escape closes only the Popover that opened together with the Dialog around it", async () => {
  await click(q.button("Open welcome"));
  expect(q.dialog("Welcome")).toBeVisible();
  expect(q.dialog("Tips")).toBeVisible();
  // The popover doesn't take focus, so the key press starts in the dialog.
  expect(q.button("Tips")).toHaveFocus();
  await press.Escape();
  expect(q.dialog.maybe("Tips")).not.toBeInTheDocument();
  expect(q.dialog("Welcome")).toBeVisible();
  // The dialog is the topmost popup again, so the next Escape closes it.
  await press.Escape();
  expect(q.dialog.maybe("Welcome")).not.toBeInTheDocument();
});

// https://github.com/ariakit/ariakit/issues/7722
test("Escape closes the Combobox popover before a Dialog outside its tree after the popover element changes", async () => {
  await click(q.button("Open reminder"));
  expect(q.dialog("Reminder")).toBeVisible();
  await focus(q.combobox("Sauce"));
  await press.ArrowDown();
  expect(q.listbox("Sauce")).toBeVisible();
  // No item matches, so the listbox renders another element.
  await type("zz");
  expect(q.listbox("Sauce")).toHaveTextContent("No results");
  await press.Escape();
  expect(q.listbox.maybe("Sauce")).not.toBeInTheDocument();
  expect(q.dialog("Reminder")).toBeVisible();
  expect(q.combobox("Sauce")).toHaveFocus();
  // The dialog is the topmost popup again, so the next Escape closes it.
  await press.Escape();
  expect(q.dialog.maybe("Reminder")).not.toBeInTheDocument();
});

// https://github.com/ariakit/ariakit/issues/7728
test("Escape closes the Combobox popover before a Dialog outside its tree after the Dialog element changes", async () => {
  await click(q.button("Open offer"));
  expect(q.dialog("Offer").tagName).toBe("DIV");
  await focus(q.combobox("Spread"));
  await press.ArrowDown();
  expect(q.listbox("Spread")).toBeVisible();
  // The field has a value, so the offer renders another element.
  await type("a");
  expect(q.dialog("Offer").tagName).toBe("SECTION");
  expect(q.listbox("Spread")).toBeVisible();
  await press.Escape();
  expect(q.listbox.maybe("Spread")).not.toBeInTheDocument();
  expect(q.dialog("Offer")).toBeVisible();
  expect(q.combobox("Spread")).toHaveFocus();
  // The dialog is the topmost popup again, so the next Escape closes it.
  await press.Escape();
  expect(q.dialog.maybe("Offer")).not.toBeInTheDocument();
});

// https://github.com/ariakit/ariakit/issues/7728
test("Clicking an element that appears after the Popover opened keeps it open after the Dialog element changes", async () => {
  await click(q.button("Open recipe"));
  expect(q.dialog("Recipe").tagName).toBe("DIV");
  await click(q.button("Add comment"));
  expect(q.dialog("Comments")).toBeVisible();
  expect(q.textbox("Comment text")).toHaveFocus();
  // The field has a value, so the recipe renders another element and the send
  // button appears.
  await type("a");
  expect(q.dialog("Recipe").tagName).toBe("SECTION");
  // The popover has had focus, so only the elements that were in the page when
  // it opened count as outside, and the send button isn't one of them.
  await click(q.button("Send comment"));
  expect(q.dialog("Comments")).toBeVisible();
});

// https://github.com/ariakit/ariakit/issues/7734
test("Clicking a Dialog that opened after the Popover closes the Popover after the Dialog element changes", async () => {
  await click(q.button("Open hints"));
  expect(q.dialog("Hints")).toBeVisible();
  await click(q.button("Open update"));
  expect(q.dialog("Update").tagName).toBe("DIV");
  await click(q.checkbox("Compact"));
  expect(q.dialog("Update").tagName).toBe("SECTION");
  expect(q.dialog("Hints")).toBeVisible();
  // The popover has had focus, so it ignores the elements it didn't mark, and
  // it marked the update before the update changed its element.
  await click(q.text("Update body"));
  expect(q.dialog.maybe("Hints")).not.toBeInTheDocument();
  expect(q.dialog("Update")).toBeVisible();
});

// https://github.com/ariakit/ariakit/issues/7734
test("Clicking a Dialog that opened after the Popover closes the Popover after two Dialog elements change twice", async () => {
  await click(q.button("Open greek"));
  expect(q.dialog("Greek")).toBeVisible();
  await click(q.button("Show dialogs"));
  expect(q.dialog("Alpha").tagName).toBe("DIV");
  expect(q.dialog("Beta").tagName).toBe("DIV");
  await click(q.button("Swap dialogs"));
  expect(q.dialog("Alpha").tagName).toBe("SECTION");
  expect(q.dialog("Beta").tagName).toBe("SECTION");
  await click(q.button("Swap dialogs"));
  expect(q.dialog("Alpha").tagName).toBe("DIV");
  expect(q.dialog("Beta").tagName).toBe("DIV");
  expect(q.dialog("Greek")).toBeVisible();
  // The popover has had focus, so it ignores the elements it didn't mark, and
  // it must have marked the third element of each dialog.
  await click(q.text("Beta body"));
  expect(q.dialog.maybe("Greek")).not.toBeInTheDocument();
  expect(q.dialog("Alpha")).toBeVisible();
});

// https://github.com/ariakit/ariakit/issues/7734
test("Clicking a Dialog that mounted after the Popover opened keeps it open after the Dialog element changes", async () => {
  await click(q.button("Open notes"));
  expect(q.dialog("Notes")).toBeVisible();
  await click(q.button("Mount late"));
  expect(q.dialog("Late").tagName).toBe("DIV");
  await click(q.button("Swap late"));
  expect(q.dialog("Late").tagName).toBe("SECTION");
  await click(q.button("Swap late"));
  expect(q.dialog("Late").tagName).toBe("DIV");
  // The popover has had focus, so only the elements that were in the page when
  // it opened count as outside, and the late dialog isn't one of them.
  await click(q.text("Late body"));
  // The popover must still be open to swap the dialog again.
  await click(q.button("Swap late"));
  expect(q.dialog("Late").tagName).toBe("SECTION");
  expect(q.dialog("Notes")).toBeVisible();
});

// https://github.com/ariakit/ariakit/issues/7734
test("Clicking a Dialog that opened before the Popover closes the Popover after the Dialog moves out of its portal node", async () => {
  await click(q.button("Open bulletin"));
  expect(q.dialog("Bulletin")).toBeVisible();
  await click(q.button("Open pins"));
  expect(q.dialog("Pins")).toBeVisible();
  await click(q.checkbox("Portal"));
  expect(q.checkbox("Portal")).not.toBeChecked();
  expect(q.dialog("Pins")).toBeVisible();
  // The popover has had focus, so it ignores the elements it didn't mark, and
  // it marked the bulletin through the portal node before the bulletin moved.
  await click(q.text("Bulletin body"));
  expect(q.dialog.maybe("Pins")).not.toBeInTheDocument();
  expect(q.dialog("Bulletin")).toBeVisible();
});

// https://github.com/ariakit/ariakit/issues/7722
test("Escape closes the Combobox popover before a Dialog outside its tree after the Dialog id and portal change", async () => {
  await click(q.button("Open banner"));
  expect(q.dialog("Banner")).toHaveAttribute("id", "banner-empty");
  await focus(q.combobox("Dip"));
  await press.ArrowDown();
  expect(q.listbox("Dip")).toBeVisible();
  // The field has a value, so the banner moves and gets another id.
  await type("a");
  expect(q.dialog("Banner")).toHaveAttribute("id", "banner-filled");
  expect(q.listbox("Dip")).toBeVisible();
  await press.Escape();
  expect(q.listbox.maybe("Dip")).not.toBeInTheDocument();
  expect(q.dialog("Banner")).toBeVisible();
  expect(q.combobox("Dip")).toHaveFocus();
  // The dialog is the topmost popup again, so the next Escape closes it.
  await press.Escape();
  expect(q.dialog.maybe("Banner")).not.toBeInTheDocument();
});

// https://github.com/ariakit/ariakit/issues/7726
test("Escape closes the Combobox popover before a Dialog outside its tree when a Dialog in a shadow root has the same id", async () => {
  const shadow = queryShadowRoot("memo");
  await click(q.button("Open memo"));
  expect(q.dialog("Memo")).toBeVisible();
  // The dialog in the shadow root opens before the listbox and ignores Escape,
  // so it stays open.
  await click(shadow.button("Open shadow memo"));
  expect(shadow.dialog("Shadow memo")).toBeVisible();
  await focus(q.combobox("Cheese"));
  await press.ArrowDown();
  await press.ArrowDown();
  expect(q.option("Apple")).toHaveAttribute("data-active-item");
  await press.Escape();
  expect(q.listbox.maybe("Cheese")).not.toBeInTheDocument();
  expect(q.dialog("Memo")).toBeVisible();
  expect(q.combobox("Cheese")).toHaveFocus();
  // The dialog is the topmost popup in its root again, so the next Escape
  // closes it.
  await press.Escape();
  expect(q.dialog.maybe("Memo")).not.toBeInTheDocument();
  expect(shadow.dialog("Shadow memo")).toBeVisible();
});
