import { click, focus, hover, press, q, type } from "@ariakit/test";
import { expect, test } from "vitest";

function queryShadowRoot(name: string) {
  const host = document.querySelector(`[data-shadow-host="${name}"]`);
  return q.within(
    host?.shadowRoot?.querySelector<HTMLElement>("[data-shadow-container]"),
  );
}

// The style of the backdrop that replaces the clear one.
const dimBackdropStyle = { backgroundColor: "rgba(0, 0, 0, 0.1)" };

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

// https://github.com/ariakit/ariakit/issues/7751
test("Escape closes the Combobox popover before a Popover outside its tree after the Popover moves out of a portal", async () => {
  const counter = q.within(q.region("Tea counter"));
  await click(q.button("Open tip"));
  expect(q.dialog("Tip")).toBeVisible();
  expect(counter.dialog.maybe("Tip")).not.toBeInTheDocument();
  await focus(q.combobox("Tea"));
  await press.ArrowDown();
  expect(q.listbox("Tea")).toBeVisible();
  // The field has a value, so the tip moves out of its portal to the counter.
  await type("a");
  expect(counter.dialog("Tip")).toBeVisible();
  expect(q.listbox("Tea")).toBeVisible();
  await press.Escape();
  expect(q.listbox.maybe("Tea")).not.toBeInTheDocument();
  expect(q.dialog("Tip")).toBeVisible();
  expect(q.combobox("Tea")).toHaveFocus();
  // The popover is the topmost popup again, so the next Escape closes it.
  await press.Escape();
  expect(q.dialog.maybe("Tip")).not.toBeInTheDocument();
});

// https://github.com/ariakit/ariakit/issues/7751
test("Escape closes the Combobox popover before a Menu outside its tree after the Menu moves out of a portal", async () => {
  const counter = q.within(q.region("Juice counter"));
  await click(q.button("Extras"));
  expect(q.menu("Extras")).toBeVisible();
  expect(counter.menu.maybe("Extras")).not.toBeInTheDocument();
  await focus(q.combobox("Juice"));
  await press.ArrowDown();
  expect(q.listbox("Juice")).toBeVisible();
  // The field has a value, so the menu moves out of its portal to the counter.
  await type("a");
  expect(counter.menu("Extras")).toBeVisible();
  expect(q.listbox("Juice")).toBeVisible();
  await press.Escape();
  expect(q.listbox.maybe("Juice")).not.toBeInTheDocument();
  expect(q.menu("Extras")).toBeVisible();
  expect(q.combobox("Juice")).toHaveFocus();
  // The menu is the topmost popup again, so the next Escape closes it.
  await press.Escape();
  expect(q.menu.maybe("Extras")).not.toBeInTheDocument();
});

// https://github.com/ariakit/ariakit/issues/7751
test("Escape closes the modal Dialog before a Popover outside its tree after that Popover moves out of a portal", async () => {
  // The modal dialog disables the page around it, so these queries include the
  // elements that aren't exposed.
  const counter = q.within(q.region.hidden("Cider counter"));
  await click(q.button("Open receipt"));
  expect(q.dialog("Receipt")).toBeVisible();
  await click(q.button("Open preferences"));
  expect(q.textbox("Cider")).toHaveFocus();
  expect(q.dialog.hidden("Receipt")).toBeVisible();
  expect(counter.dialog.maybe.hidden("Receipt")).not.toBeInTheDocument();
  // The field has a value, so the receipt moves out of its portal to the
  // counter.
  await type("a");
  const receipt = counter.dialog.hidden("Receipt");
  expect(receipt).toBeVisible();
  // The preferences are modal, so they disable the receipt in the counter.
  expect(receipt.closest("[inert]")).toBeTruthy();
  await press.Escape();
  expect(q.dialog.maybe("Preferences")).not.toBeInTheDocument();
  expect(q.dialog("Receipt")).toBeVisible();
  expect(q.button("Open preferences")).toHaveFocus();
  // The receipt is the topmost popup again, so the next Escape closes it.
  await press.Escape();
  expect(q.dialog.maybe("Receipt")).not.toBeInTheDocument();
});

// https://github.com/ariakit/ariakit/issues/7764
test("Clicking the backdrop of a Dialog closes the Combobox popover that opened after it after the Dialog moves out of a portal", async () => {
  const counter = q.within(q.region("Milk counter"));
  await click(q.button("Open flyer"));
  expect(q.dialog("Flyer")).toBeVisible();
  expect(counter.presentation.maybe()).not.toBeInTheDocument();
  await click(q.combobox("Milk"));
  expect(q.listbox("Milk")).toBeVisible();
  // The field has a value, so the flyer and its backdrop move out of their
  // portal to the counter.
  await type("a");
  expect(counter.dialog("Flyer")).toBeVisible();
  expect(q.listbox("Milk")).toBeVisible();
  // The backdrop in the counter is outside both popups, so a click on it closes
  // them.
  await click(counter.presentation());
  expect(q.dialog.maybe("Flyer")).not.toBeInTheDocument();
  expect(q.listbox.maybe("Milk")).not.toBeInTheDocument();
});

// https://github.com/ariakit/ariakit/issues/7764
test("Clicking the backdrop of a Popover closes the Combobox popover that opened after it after the Popover moves out of a portal", async () => {
  const counter = q.within(q.region("Butter counter"));
  await click(q.button("Open leaflet"));
  expect(q.dialog("Leaflet")).toBeVisible();
  expect(counter.presentation.maybe()).not.toBeInTheDocument();
  await click(q.combobox("Butter"));
  expect(q.listbox("Butter")).toBeVisible();
  // The field has a value, so the leaflet and its backdrop move out of their
  // portal to the counter.
  await type("a");
  expect(counter.dialog("Leaflet")).toBeVisible();
  expect(q.listbox("Butter")).toBeVisible();
  // The backdrop in the counter is outside both popups, so a click on it closes
  // them.
  await click(counter.presentation());
  expect(q.dialog.maybe("Leaflet")).not.toBeInTheDocument();
  expect(q.listbox.maybe("Butter")).not.toBeInTheDocument();
});

// https://github.com/ariakit/ariakit/issues/7764
test("The modal Dialog disables the backdrop of a Dialog outside its tree after that Dialog moves out of a portal", async () => {
  // The modal dialog disables the page around it, so these queries include the
  // elements that aren't exposed.
  const counter = q.within(q.region.hidden("Cream counter"));
  await click(q.button("Open poster"));
  expect(q.dialog("Poster")).toBeVisible();
  await click(q.button("Open options"));
  expect(q.textbox("Cream")).toHaveFocus();
  expect(q.dialog.hidden("Poster")).toBeVisible();
  expect(counter.presentation.maybe.hidden()).not.toBeInTheDocument();
  // The field has a value, so the poster and its backdrop move out of their
  // portal to the counter.
  await type("a");
  expect(counter.dialog.hidden("Poster")).toBeVisible();
  // The options are modal, so they disable the backdrop in the counter. The
  // browser test covers the click, because the pointer goes through a disabled
  // element only in a real browser.
  expect(counter.presentation.hidden().closest("[inert]")).toBeTruthy();
});

// https://github.com/ariakit/ariakit/issues/7772
test("Clicking the backdrop of a Dialog closes the Combobox popover that opened after it after the Dialog gets that backdrop", async () => {
  const counter = q.within(q.region("Yogurt counter"));
  await click(q.button("Open sign"));
  expect(q.dialog("Sign")).toBeVisible();
  await click(q.combobox("Yogurt"));
  expect(q.listbox("Yogurt")).toBeVisible();
  expect(counter.presentation.maybe()).not.toBeInTheDocument();
  // The field has a value, so the sign gets its backdrop.
  await type("a");
  expect(counter.presentation()).toBeVisible();
  expect(q.listbox("Yogurt")).toBeVisible();
  // The new backdrop is outside both popups, so a click on it closes them.
  await click(counter.presentation());
  expect(q.dialog.maybe("Sign")).not.toBeInTheDocument();
  expect(q.listbox.maybe("Yogurt")).not.toBeInTheDocument();
});

// https://github.com/ariakit/ariakit/issues/7772
test("Clicking the backdrop of a Popover closes the Combobox popover that opened after it after the Popover gets that backdrop", async () => {
  const counter = q.within(q.region("Kefir counter"));
  await click(q.button("Open badge"));
  expect(q.dialog("Badge")).toBeVisible();
  await click(q.combobox("Kefir"));
  expect(q.listbox("Kefir")).toBeVisible();
  expect(counter.presentation.maybe()).not.toBeInTheDocument();
  // The field has a value, so the badge gets its backdrop.
  await type("a");
  expect(counter.presentation()).toBeVisible();
  expect(q.listbox("Kefir")).toBeVisible();
  // The new backdrop is outside both popups, so a click on it closes them.
  await click(counter.presentation());
  expect(q.dialog.maybe("Badge")).not.toBeInTheDocument();
  expect(q.listbox.maybe("Kefir")).not.toBeInTheDocument();
});

// https://github.com/ariakit/ariakit/issues/7772
test("The modal Dialog disables the backdrop of a Dialog outside its tree after that Dialog gets that backdrop", async () => {
  // The modal dialog disables the page around it, so these queries include the
  // elements that aren't exposed.
  const counter = q.within(q.region.hidden("Custard counter"));
  await click(q.button("Open placard"));
  expect(q.dialog("Placard")).toBeVisible();
  await click(q.button("Open choices"));
  expect(q.textbox("Custard")).toHaveFocus();
  expect(q.dialog.hidden("Placard")).toBeVisible();
  expect(counter.presentation.maybe.hidden()).not.toBeInTheDocument();
  // The field has a value, so the placard gets its backdrop.
  await type("a");
  expect(counter.presentation.hidden()).toBeVisible();
  // The choices are modal, so they disable the new backdrop. The browser test
  // covers the click, because the pointer goes through a disabled element only
  // in a real browser.
  expect(counter.presentation.hidden().closest("[inert]")).toBeTruthy();
});

// https://github.com/ariakit/ariakit/issues/7772
test("The backdrop of a Dialog keeps the z-index of the Dialog after the backdrop element changes", async () => {
  const counter = q.within(q.region("Ghee counter"));
  await click(q.button("Open pennant"));
  expect(q.dialog("Pennant")).toHaveStyle({ zIndex: "1" });
  expect(counter.presentation()).toHaveStyle({ zIndex: "1" });
  await click(q.combobox("Ghee"));
  // The field has a value, so the dim backdrop replaces the clear one.
  await type("a");
  expect(counter.presentation()).toHaveStyle(dimBackdropStyle);
  expect(counter.presentation()).toHaveStyle({ zIndex: "1" });
});

// https://github.com/ariakit/ariakit/issues/7772
test("Clicking the backdrop of a Dialog closes the Dialog after the backdrop element changes", async () => {
  const counter = q.within(q.region("Ghee counter"));
  await click(q.button("Open pennant"));
  expect(q.dialog("Pennant")).toBeVisible();
  expect(counter.presentation()).not.toHaveStyle(dimBackdropStyle);
  await click(q.combobox("Ghee"));
  expect(q.listbox("Ghee")).toBeVisible();
  // The field has a value, so the dim backdrop replaces the clear one.
  await type("a");
  expect(counter.presentation()).toHaveStyle(dimBackdropStyle);
  // The listbox closes first, so the pennant is the only open popup.
  await press.Escape();
  expect(q.listbox.maybe("Ghee")).not.toBeInTheDocument();
  expect(q.dialog("Pennant")).toBeVisible();
  // The new backdrop is outside the pennant, so a click on it closes the
  // pennant.
  await click(counter.presentation());
  expect(q.dialog.maybe("Pennant")).not.toBeInTheDocument();
});

// https://github.com/ariakit/ariakit/issues/7772
test("Clicking the backdrop of a Dialog closes the Combobox popover that opened after it after the backdrop element changes", async () => {
  const counter = q.within(q.region("Ghee counter"));
  await click(q.button("Open pennant"));
  expect(q.dialog("Pennant")).toBeVisible();
  await click(q.combobox("Ghee"));
  expect(q.listbox("Ghee")).toBeVisible();
  // The field has a value, so the dim backdrop replaces the clear one.
  await type("a");
  expect(counter.presentation()).toHaveStyle(dimBackdropStyle);
  expect(q.listbox("Ghee")).toBeVisible();
  // The new backdrop is outside both popups, so a click on it closes them. The
  // listbox goes first here, because the test above covers the pennant.
  await click(counter.presentation());
  expect(q.listbox.maybe("Ghee")).not.toBeInTheDocument();
  expect(q.dialog.maybe("Pennant")).not.toBeInTheDocument();
});

// https://github.com/ariakit/ariakit/issues/7774
test("The modal Dialog keeps the modal Dialog that opened after it enabled after it moves out of a portal", async () => {
  // The modal dialogs disable the page around them, so these queries include
  // the elements that aren't exposed.
  const counter = q.within(q.region.hidden("Sugar counter"));
  await click(q.button("Open invoice"));
  expect(q.dialog("Invoice")).toBeVisible();
  await click(q.button("Open discount"));
  expect(q.textbox("Sugar")).toHaveFocus();
  expect(counter.dialog.maybe.hidden("Invoice")).not.toBeInTheDocument();
  // The field has a value, so the invoice moves out of its portal to the
  // counter.
  await type("a");
  expect(counter.dialog.hidden("Invoice")).toBeVisible();
  // The discount opened after the invoice, so the invoice doesn't disable it.
  expect(q.textbox("Sugar")).toHaveFocus();
  await click(q.button("Add sugar"));
  expect(q.text("Sugar jars: 1")).toBeVisible();
  await press.Escape();
  expect(q.dialog.maybe("Discount")).not.toBeInTheDocument();
  expect(q.dialog("Invoice")).toBeVisible();
  // The invoice is modal, so it still disables the counter around it.
  expect(counter.button.hidden("Open invoice").closest("[inert]")).toBeTruthy();
  // The invoice is the topmost popup again, so the next Escape closes it.
  await press.Escape();
  expect(q.dialog.maybe("Invoice")).not.toBeInTheDocument();
});

// https://github.com/ariakit/ariakit/issues/7774
test("The modal Dialog keeps the modal Dialog that opened after it enabled after it moves to a portal", async () => {
  // The modal dialogs disable the page around them, so these queries include
  // the elements that aren't exposed.
  const counter = q.within(q.region.hidden("Salt counter"));
  await click(q.button("Open bill"));
  expect(q.dialog("Bill")).toBeVisible();
  await click(q.button("Open refund"));
  expect(q.textbox("Salt")).toHaveFocus();
  expect(counter.dialog.hidden("Bill")).toBeVisible();
  // The field has a value, so the bill moves out of the counter to a portal.
  await type("a");
  expect(counter.dialog.maybe.hidden("Bill")).not.toBeInTheDocument();
  expect(q.dialog.hidden("Bill")).toBeVisible();
  // The refund opened after the bill, so the bill doesn't disable it.
  expect(q.textbox("Salt")).toHaveFocus();
  await click(q.button("Add salt"));
  expect(q.text("Salt jars: 1")).toBeVisible();
  await press.Escape();
  expect(q.dialog.maybe("Refund")).not.toBeInTheDocument();
  expect(q.dialog("Bill")).toBeVisible();
  // The bill is modal, so it still disables the counter that it left.
  expect(counter.button.hidden("Open bill").closest("[inert]")).toBeTruthy();
  // The bill is the topmost popup again, so the next Escape closes it.
  await press.Escape();
  expect(q.dialog.maybe("Bill")).not.toBeInTheDocument();
});

// https://github.com/ariakit/ariakit/issues/7774
test("The modal Dialog keeps the modal Dialog that opened next to it enabled after it moves to a portal", async () => {
  // The modal dialogs disable the page around them, so these queries include
  // the elements that aren't exposed.
  const counter = q.within(q.region.hidden("Pepper counter"));
  await click(q.button("Open quote"));
  expect(q.dialog("Quote")).toBeVisible();
  await click(q.button("Open deposit"));
  expect(q.textbox("Pepper")).toHaveFocus();
  expect(counter.dialog.hidden("Quote")).toBeVisible();
  // The deposit renders in the counter too, and it stays there when the field
  // has a value and the quote moves out of the counter to a portal.
  await type("a");
  expect(counter.dialog.maybe.hidden("Quote")).not.toBeInTheDocument();
  expect(q.dialog.hidden("Quote")).toBeVisible();
  expect(counter.dialog("Deposit")).toBeVisible();
  // The deposit opened after the quote, so the quote doesn't disable it.
  expect(q.textbox("Pepper")).toHaveFocus();
  await click(q.button("Add pepper"));
  expect(q.text("Pepper jars: 1")).toBeVisible();
  await press.Escape();
  expect(q.dialog.maybe("Deposit")).not.toBeInTheDocument();
  expect(q.dialog("Quote")).toBeVisible();
  // The quote is modal, so it still disables the counter that it left.
  expect(counter.button.hidden("Open quote").closest("[inert]")).toBeTruthy();
  // The quote is the topmost popup again, so the next Escape closes it.
  await press.Escape();
  expect(q.dialog.maybe("Quote")).not.toBeInTheDocument();
});

// https://github.com/ariakit/ariakit/issues/7774
test("The modal Dialog keeps the modal Dialog that opened after it enabled after it moves to a new portal node", async () => {
  // The modal dialogs disable the page around them, so these queries include
  // the elements that aren't exposed.
  const counter = q.within(q.region.hidden("Flour counter"));
  await click(q.button("Open estimate"));
  expect(q.dialog("Estimate")).toBeVisible();
  await click(q.button("Open rebate"));
  expect(q.textbox("Flour")).toHaveFocus();
  expect(counter.dialog.hidden("Estimate")).toBeVisible();
  // The field has a value, so the estimate moves out of the slot in the counter
  // to the default portal node. Its portal stays on.
  await type("a");
  expect(counter.dialog.maybe.hidden("Estimate")).not.toBeInTheDocument();
  expect(q.dialog.hidden("Estimate")).toBeVisible();
  // The rebate opened after the estimate, so the estimate doesn't disable it.
  expect(q.textbox("Flour")).toHaveFocus();
  await click(q.button("Add flour"));
  expect(q.text("Flour jars: 1")).toBeVisible();
  await press.Escape();
  expect(q.dialog.maybe("Rebate")).not.toBeInTheDocument();
  expect(q.dialog("Estimate")).toBeVisible();
  // The estimate is modal, so it still disables the counter that it left.
  expect(
    counter.button.hidden("Open estimate").closest("[inert]"),
  ).toBeTruthy();
  // The estimate is the topmost popup again, so the next Escape closes it.
  await press.Escape();
  expect(q.dialog.maybe("Estimate")).not.toBeInTheDocument();
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
