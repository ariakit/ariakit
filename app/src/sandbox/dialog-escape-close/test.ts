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

// https://github.com/ariakit/ariakit/issues/7733
test("Escape closes the Combobox popover before a Dialog outside its tree after the Dialog moves to a portal", async () => {
  const counter = q.within(q.region("Jam counter"));
  await click(q.button("Open coupon"));
  expect(counter.dialog("Coupon")).toBeVisible();
  await focus(q.combobox("Jam"));
  await press.ArrowDown();
  expect(q.listbox("Jam")).toBeVisible();
  // The field has a value, so the coupon moves out of the counter to a portal.
  await type("a");
  expect(counter.dialog.maybe("Coupon")).not.toBeInTheDocument();
  expect(q.dialog("Coupon")).toBeVisible();
  expect(q.listbox("Jam")).toBeVisible();
  await press.Escape();
  expect(q.listbox.maybe("Jam")).not.toBeInTheDocument();
  expect(q.dialog("Coupon")).toBeVisible();
  expect(q.combobox("Jam")).toHaveFocus();
  // The dialog is the topmost popup again, so the next Escape closes it.
  await press.Escape();
  expect(q.dialog.maybe("Coupon")).not.toBeInTheDocument();
});

// https://github.com/ariakit/ariakit/issues/7733
test("Escape closes the Combobox popover before a Dialog outside its tree after the Dialog moves to a portal and back", async () => {
  const counter = q.within(q.region("Jam counter"));
  await click(q.button("Open coupon"));
  expect(counter.dialog("Coupon")).toBeVisible();
  await focus(q.combobox("Jam"));
  await press.ArrowDown();
  expect(q.listbox("Jam")).toBeVisible();
  // The field has a value, so the coupon moves out of the counter to a portal.
  await type("a");
  expect(counter.dialog.maybe("Coupon")).not.toBeInTheDocument();
  expect(q.dialog("Coupon")).toBeVisible();
  // The field is empty again, so the coupon moves back to the counter.
  await press.Backspace();
  expect(counter.dialog("Coupon")).toBeVisible();
  expect(q.listbox("Jam")).toBeVisible();
  await press.Escape();
  expect(q.listbox.maybe("Jam")).not.toBeInTheDocument();
  expect(q.dialog("Coupon")).toBeVisible();
  expect(q.combobox("Jam")).toHaveFocus();
  // The dialog is the topmost popup again, so the next Escape closes it.
  await press.Escape();
  expect(q.dialog.maybe("Coupon")).not.toBeInTheDocument();
});

// https://github.com/ariakit/ariakit/issues/7733
test("Escape closes the Combobox popover before a Dialog outside its tree after the Dialog moves to a new portal node", async () => {
  const counter = q.within(q.region("Syrup counter"));
  await click(q.button("Open voucher"));
  expect(counter.dialog("Voucher")).toBeVisible();
  await focus(q.combobox("Syrup"));
  await press.ArrowDown();
  expect(q.listbox("Syrup")).toBeVisible();
  // The field has a value, so the voucher moves out of the counter to the
  // default portal.
  await type("a");
  expect(counter.dialog.maybe("Voucher")).not.toBeInTheDocument();
  expect(q.dialog("Voucher")).toBeVisible();
  expect(q.listbox("Syrup")).toBeVisible();
  await press.Escape();
  expect(q.listbox.maybe("Syrup")).not.toBeInTheDocument();
  expect(q.dialog("Voucher")).toBeVisible();
  expect(q.combobox("Syrup")).toHaveFocus();
  // The dialog is the topmost popup again, so the next Escape closes it.
  await press.Escape();
  expect(q.dialog.maybe("Voucher")).not.toBeInTheDocument();
});

// https://github.com/ariakit/ariakit/issues/7733
test("Escape closes the modal Dialog before a Dialog outside its tree after that Dialog moves to a portal", async () => {
  // The modal dialog disables the page around it, so these queries include the
  // elements that aren't exposed.
  const counter = q.within(q.region.hidden("Honey counter"));
  await click(q.button("Open ticket"));
  expect(q.dialog("Ticket")).toBeVisible();
  await click(q.button("Open settings"));
  expect(q.textbox("Honey")).toHaveFocus();
  expect(counter.dialog.hidden("Ticket")).toBeVisible();
  // The field has a value, so the ticket moves out of the counter to a portal.
  await type("a");
  expect(counter.dialog.maybe.hidden("Ticket")).not.toBeInTheDocument();
  const ticket = q.dialog.hidden("Ticket");
  expect(ticket).toBeVisible();
  // The settings are modal, so they disable the ticket in its new portal node.
  expect(ticket.closest("[inert]")).toBeTruthy();
  await press.Escape();
  expect(q.dialog.maybe("Settings")).not.toBeInTheDocument();
  expect(q.dialog("Ticket")).toBeVisible();
  expect(q.button("Open settings")).toHaveFocus();
  // The ticket is the topmost popup again, so the next Escape closes it.
  await press.Escape();
  expect(q.dialog.maybe("Ticket")).not.toBeInTheDocument();
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
