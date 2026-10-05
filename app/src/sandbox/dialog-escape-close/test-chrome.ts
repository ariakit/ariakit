import type { Page } from "@playwright/test";
import { flushFrames, withFramework } from "#app/test-utils/preview.ts";

withFramework(import.meta.dirname, async ({ query, test }) => {
  const pressEscapeOnce = async (page: Page, label: string) => {
    const closeRequests = query(page).text(
      new RegExp(`^${label} close requests: `),
    );
    await test.expect(closeRequests).toHaveText(`${label} close requests: 0`);
    await page.keyboard.press("Escape");
    await test.expect(closeRequests).toHaveText(`${label} close requests: 1`);
    // Hovercard, which Menu and Tooltip are based on, can request a close again
    // two animation frames after Escape. The count must stay the same after
    // them.
    await flushFrames(page, 2);
    await test.expect(closeRequests).toHaveText(`${label} close requests: 1`);
  };

  // https://github.com/ariakit/ariakit/issues/7622
  test("Escape requests one close in Menu", async ({ page, q }) => {
    await q.button("Actions").click();
    await test.expect(q.menu("Actions")).toBeVisible();
    await pressEscapeOnce(page, "Actions");
    await test.expect(q.menu("Actions")).toBeVisible();
  });

  // https://github.com/ariakit/ariakit/issues/7622
  test("Escape requests one close in Hovercard", async ({ page, q }) => {
    const anchor = q.link("@ariakit");
    // Ariakit resets hover intent on scroll, so the anchor must be in view
    // before the pointer moves over it.
    await anchor.scrollIntoViewIfNeeded();
    await anchor.hover();
    await test.expect(q.dialog("Ariakit profile")).toBeVisible();
    await pressEscapeOnce(page, "Profile");
    await test.expect(q.dialog("Ariakit profile")).toBeVisible();
  });

  // https://github.com/ariakit/ariakit/issues/7622
  test("Escape requests one close in Tooltip", async ({ page, q }) => {
    await q.button("Bold").focus();
    await test.expect(q.tooltip("Make the text bold")).toBeVisible();
    await pressEscapeOnce(page, "Bold");
    await test.expect(q.tooltip("Make the text bold")).toBeVisible();
  });

  // https://github.com/ariakit/ariakit/issues/7623
  test("Escape requests one close in ComboboxSelect", async ({ page, q }) => {
    await q.combobox("Fruit").click();
    await page.keyboard.press("ArrowDown");
    await test.expect(q.option("Banana")).toHaveAttribute("data-active-item");
    await pressEscapeOnce(page, "Fruit");
    await test.expect(q.listbox("Fruit")).toBeVisible();
  });

  // https://github.com/ariakit/ariakit/issues/7623
  test("Escape requests one close in Select", async ({ page, q }) => {
    await q.combobox("Dessert").click();
    await page.keyboard.press("ArrowDown");
    await test.expect(q.option("Banana")).toHaveAttribute("data-active-item");
    await pressEscapeOnce(page, "Dessert");
    await test.expect(q.listbox("Dessert")).toBeVisible();
  });

  // https://github.com/ariakit/ariakit/issues/7623
  test("Escape requests one close in Combobox with an active item", async ({
    page,
    q,
  }) => {
    await q.combobox("Snack").focus();
    await page.keyboard.press("ArrowDown");
    await page.keyboard.press("ArrowDown");
    await test.expect(q.option("Apple")).toHaveAttribute("data-active-item");
    await pressEscapeOnce(page, "Snack");
    await test.expect(q.listbox("Snack")).toBeVisible();
  });

  // https://github.com/ariakit/ariakit/issues/7623
  test("Escape requests one close in ComboboxSelect with ComboboxInput", async ({
    page,
    q,
  }) => {
    await q.combobox("Smoothie").click();
    await test.expect(q.combobox("Search fruits")).toBeFocused();
    await page.keyboard.press("ArrowDown");
    await test.expect(q.option("Banana")).toHaveAttribute("data-active-item");
    await pressEscapeOnce(page, "Smoothie");
    await test.expect(q.listbox()).toBeVisible();
  });

  // https://github.com/ariakit/ariakit/issues/7622
  // https://github.com/ariakit/ariakit/issues/7623
  test("Escape requests one close in Menu with Combobox", async ({
    page,
    q,
  }) => {
    await q.button("Add block").click();
    await test.expect(q.combobox("Search blocks")).toBeFocused();
    await page.keyboard.press("ArrowDown");
    await test
      .expect(q.option("Paragraph"))
      .toHaveAttribute("data-active-item");
    await pressEscapeOnce(page, "Add block");
    // A menu with a combobox has the dialog role.
    await test.expect(q.dialog("Add block")).toBeVisible();
  });

  // https://github.com/ariakit/ariakit/issues/7632
  test("Escape closes only the Combobox popover in a Dialog", async ({
    page,
    q,
  }) => {
    await q.button("Open order").click();
    await test.expect(q.dialog("Order")).toBeVisible();
    await q.combobox("Topping").focus();
    await page.keyboard.press("ArrowDown");
    await test.expect(q.listbox("Topping")).toBeVisible();
    await test
      .expect(q.option("Apple"))
      .not.toHaveAttribute("data-active-item");
    await page.keyboard.press("Escape");
    await test.expect(q.listbox("Topping")).toBeHidden();
    await test.expect(q.dialog("Order")).toBeVisible();
    await test.expect(q.combobox("Topping")).toBeFocused();
    // The dialog is the topmost popup again, so the next Escape closes it.
    await page.keyboard.press("Escape");
    await test.expect(q.dialog("Order")).toBeHidden();
    await test.expect(q.button("Open order")).toBeFocused();
  });

  // https://github.com/ariakit/ariakit/issues/7632
  test("Escape closes only the Combobox popover with an active item in a Dialog", async ({
    page,
    q,
  }) => {
    await q.button("Open order").click();
    await test.expect(q.dialog("Order")).toBeVisible();
    await q.combobox("Topping").focus();
    await page.keyboard.press("ArrowDown");
    await page.keyboard.press("ArrowDown");
    await test.expect(q.option("Apple")).toHaveAttribute("data-active-item");
    await page.keyboard.press("Escape");
    await test.expect(q.listbox("Topping")).toBeHidden();
    await test.expect(q.dialog("Order")).toBeVisible();
    await test.expect(q.combobox("Topping")).toBeFocused();
    // The dialog is the topmost popup again, so the next Escape closes it.
    await page.keyboard.press("Escape");
    await test.expect(q.dialog("Order")).toBeHidden();
    await test.expect(q.button("Open order")).toBeFocused();
  });

  // https://github.com/ariakit/ariakit/issues/7632
  test("Escape closes only the ComboboxSelect popover in a Dialog", async ({
    page,
    q,
  }) => {
    await q.button("Open order").click();
    await test.expect(q.dialog("Order")).toBeVisible();
    await q.combobox("Side").click();
    await page.keyboard.press("ArrowDown");
    await test.expect(q.option("Banana")).toHaveAttribute("data-active-item");
    await page.keyboard.press("Escape");
    await test.expect(q.listbox("Side")).toBeHidden();
    await test.expect(q.dialog("Order")).toBeVisible();
    await test.expect(q.combobox("Side")).toBeFocused();
    // The dialog is the topmost popup again, so the next Escape closes it.
    await page.keyboard.press("Escape");
    await test.expect(q.dialog("Order")).toBeHidden();
    await test.expect(q.button("Open order")).toBeFocused();
  });

  // https://github.com/ariakit/ariakit/issues/7647
  test("Escape closes the Combobox popover before a Dialog outside its tree", async ({
    page,
    q,
  }) => {
    await q.button("Open notice").click();
    await test.expect(q.dialog("Notice")).toBeVisible();
    await q.combobox("Drink").focus();
    await page.keyboard.press("ArrowDown");
    await test.expect(q.listbox("Drink")).toBeVisible();
    await test
      .expect(q.option("Apple"))
      .not.toHaveAttribute("data-active-item");
    await page.keyboard.press("Escape");
    await test.expect(q.listbox("Drink")).toBeHidden();
    await test.expect(q.dialog("Notice")).toBeVisible();
    await test.expect(q.combobox("Drink")).toBeFocused();
    // The dialog is the topmost popup again, so the next Escape closes it.
    await page.keyboard.press("Escape");
    await test.expect(q.dialog("Notice")).toBeHidden();
  });

  // https://github.com/ariakit/ariakit/issues/7647
  test("Escape closes the Combobox popover with an active item before a Dialog outside its tree", async ({
    page,
    q,
  }) => {
    await q.button("Open notice").click();
    await test.expect(q.dialog("Notice")).toBeVisible();
    await q.combobox("Drink").focus();
    await page.keyboard.press("ArrowDown");
    await page.keyboard.press("ArrowDown");
    await test.expect(q.option("Apple")).toHaveAttribute("data-active-item");
    await page.keyboard.press("Escape");
    await test.expect(q.listbox("Drink")).toBeHidden();
    await test.expect(q.dialog("Notice")).toBeVisible();
    await test.expect(q.combobox("Drink")).toBeFocused();
    // The dialog is the topmost popup again, so the next Escape closes it.
    await page.keyboard.press("Escape");
    await test.expect(q.dialog("Notice")).toBeHidden();
  });

  // https://github.com/ariakit/ariakit/issues/7647
  test("Escape closes the Combobox popover before the Tooltip of its input", async ({
    page,
    q,
  }) => {
    await q.combobox("Garnish").focus();
    await test.expect(q.tooltip("Search garnishes")).toBeVisible();
    await page.keyboard.press("ArrowDown");
    await test.expect(q.listbox("Garnish")).toBeVisible();
    await page.keyboard.press("Escape");
    await test.expect(q.listbox("Garnish")).toBeHidden();
    await test.expect(q.tooltip("Search garnishes")).toBeVisible();
    await test.expect(q.combobox("Garnish")).toBeFocused();
    // The tooltip is the topmost popup again, so the next Escape closes it.
    await page.keyboard.press("Escape");
    await test.expect(q.tooltip("Search garnishes")).toBeHidden();
  });

  // https://github.com/ariakit/ariakit/issues/7647
  test("Escape closes the Tooltip that opened after the Combobox popover of its anchor", async ({
    page,
    q,
  }) => {
    const combobox = q.combobox("Garnish");
    // Ariakit resets hover intent on scroll, so the input must be in view
    // before the pointer moves over it.
    await combobox.scrollIntoViewIfNeeded();
    await combobox.focus();
    await test.expect(q.tooltip("Search garnishes")).toBeVisible();
    // The tooltip is the only open popup, so Escape closes it.
    await page.keyboard.press("Escape");
    await test.expect(q.tooltip("Search garnishes")).toBeHidden();
    await page.keyboard.press("ArrowDown");
    await test.expect(q.listbox("Garnish")).toBeVisible();
    // The listbox is open, so the tooltip opens last this time.
    await combobox.hover();
    await test.expect(q.tooltip("Search garnishes")).toBeVisible();
    await page.keyboard.press("Escape");
    await test.expect(q.tooltip("Search garnishes")).toBeHidden();
    await test.expect(q.listbox("Garnish")).toBeVisible();
    await test.expect(q.combobox("Garnish")).toBeFocused();
    // The listbox is the topmost popup again, so the next Escape closes it.
    await page.keyboard.press("Escape");
    await test.expect(q.listbox("Garnish")).toBeHidden();
  });

  // https://github.com/ariakit/ariakit/issues/7647
  test("Escape closes only the Popover that opened together with the Dialog around it", async ({
    page,
    q,
  }) => {
    await q.button("Open welcome").click();
    await test.expect(q.dialog("Welcome")).toBeVisible();
    await test.expect(q.dialog("Tips")).toBeVisible();
    // The popover doesn't take focus, so the key press starts in the dialog.
    await test.expect(q.button("Tips")).toBeFocused();
    await page.keyboard.press("Escape");
    await test.expect(q.dialog("Tips")).toBeHidden();
    await test.expect(q.dialog("Welcome")).toBeVisible();
    // The dialog is the topmost popup again, so the next Escape closes it.
    await page.keyboard.press("Escape");
    await test.expect(q.dialog("Welcome")).toBeHidden();
  });

  // https://github.com/ariakit/ariakit/issues/7722
  test("Escape closes the Combobox popover before a Dialog outside its tree after the popover element changes", async ({
    page,
    q,
  }) => {
    await q.button("Open reminder").click();
    await test.expect(q.dialog("Reminder")).toBeVisible();
    await q.combobox("Sauce").focus();
    await page.keyboard.press("ArrowDown");
    await test.expect(q.listbox("Sauce")).toBeVisible();
    // No item matches, so the listbox renders another element.
    await page.keyboard.type("zz");
    await test.expect(q.listbox("Sauce")).toHaveText("No results");
    await page.keyboard.press("Escape");
    await test.expect(q.listbox("Sauce")).toBeHidden();
    await test.expect(q.dialog("Reminder")).toBeVisible();
    await test.expect(q.combobox("Sauce")).toBeFocused();
    // The dialog is the topmost popup again, so the next Escape closes it.
    await page.keyboard.press("Escape");
    await test.expect(q.dialog("Reminder")).toBeHidden();
  });

  // https://github.com/ariakit/ariakit/issues/7728
  test("Escape closes the Combobox popover before a Dialog outside its tree after the Dialog element changes", async ({
    page,
    q,
  }) => {
    await q.button("Open offer").click();
    await test.expect(q.dialog("Offer")).toHaveJSProperty("tagName", "DIV");
    await q.combobox("Spread").focus();
    await page.keyboard.press("ArrowDown");
    await test.expect(q.listbox("Spread")).toBeVisible();
    // The field has a value, so the offer renders another element.
    await page.keyboard.type("a");
    await test.expect(q.dialog("Offer")).toHaveJSProperty("tagName", "SECTION");
    await test.expect(q.listbox("Spread")).toBeVisible();
    await page.keyboard.press("Escape");
    await test.expect(q.listbox("Spread")).toBeHidden();
    await test.expect(q.dialog("Offer")).toBeVisible();
    await test.expect(q.combobox("Spread")).toBeFocused();
    // The dialog is the topmost popup again, so the next Escape closes it.
    await page.keyboard.press("Escape");
    await test.expect(q.dialog("Offer")).toBeHidden();
  });

  // https://github.com/ariakit/ariakit/issues/7728
  test("Clicking an element that appears after the Popover opened keeps it open after the Dialog element changes", async ({
    page,
    q,
  }) => {
    await q.button("Open recipe").click();
    await test.expect(q.dialog("Recipe")).toHaveJSProperty("tagName", "DIV");
    await q.button("Add comment").click();
    await test.expect(q.dialog("Comments")).toBeVisible();
    await test.expect(q.textbox("Comment text")).toBeFocused();
    // The field has a value, so the recipe renders another element and the send
    // button appears.
    await page.keyboard.type("a");
    await test
      .expect(q.dialog("Recipe"))
      .toHaveJSProperty("tagName", "SECTION");
    // The popover has had focus, so only the elements that were in the page
    // when it opened count as outside, and the send button isn't one of them.
    await q.button("Send comment").click();
    await test.expect(q.dialog("Comments")).toBeVisible();
  });

  // https://github.com/ariakit/ariakit/issues/7734
  test("Clicking a Dialog that opened after the Popover closes the Popover after the Dialog element changes", async ({
    q,
  }) => {
    await q.button("Open hints").click();
    await test.expect(q.dialog("Hints")).toBeVisible();
    await q.button("Open update").click();
    await test.expect(q.dialog("Update")).toHaveJSProperty("tagName", "DIV");
    await q.checkbox("Compact").click();
    await test
      .expect(q.dialog("Update"))
      .toHaveJSProperty("tagName", "SECTION");
    await test.expect(q.dialog("Hints")).toBeVisible();
    // The popover has had focus, so it ignores the elements it didn't mark, and
    // it marked the update before the update changed its element.
    await q.text("Update body").click();
    await test.expect(q.dialog("Hints")).toBeHidden();
    await test.expect(q.dialog("Update")).toBeVisible();
  });

  // https://github.com/ariakit/ariakit/issues/7734
  test("Clicking a Dialog that opened after the Popover closes the Popover after two Dialog elements change twice", async ({
    q,
  }) => {
    await q.button("Open greek").click();
    await test.expect(q.dialog("Greek")).toBeVisible();
    await q.button("Show dialogs").click();
    await test.expect(q.dialog("Alpha")).toHaveJSProperty("tagName", "DIV");
    await test.expect(q.dialog("Beta")).toHaveJSProperty("tagName", "DIV");
    await q.button("Swap dialogs").click();
    await test.expect(q.dialog("Alpha")).toHaveJSProperty("tagName", "SECTION");
    await test.expect(q.dialog("Beta")).toHaveJSProperty("tagName", "SECTION");
    await q.button("Swap dialogs").click();
    await test.expect(q.dialog("Alpha")).toHaveJSProperty("tagName", "DIV");
    await test.expect(q.dialog("Beta")).toHaveJSProperty("tagName", "DIV");
    await test.expect(q.dialog("Greek")).toBeVisible();
    // The popover has had focus, so it ignores the elements it didn't mark, and
    // it must have marked the third element of each dialog.
    await q.text("Beta body").click();
    await test.expect(q.dialog("Greek")).toBeHidden();
    await test.expect(q.dialog("Alpha")).toBeVisible();
  });

  // https://github.com/ariakit/ariakit/issues/7734
  test("Clicking a Dialog that mounted after the Popover opened keeps it open after the Dialog element changes", async ({
    q,
  }) => {
    await q.button("Open notes").click();
    await test.expect(q.dialog("Notes")).toBeVisible();
    await q.button("Mount late").click();
    await test.expect(q.dialog("Late")).toHaveJSProperty("tagName", "DIV");
    await q.button("Swap late").click();
    await test.expect(q.dialog("Late")).toHaveJSProperty("tagName", "SECTION");
    await q.button("Swap late").click();
    await test.expect(q.dialog("Late")).toHaveJSProperty("tagName", "DIV");
    // The popover has had focus, so only the elements that were in the page
    // when it opened count as outside, and the late dialog isn't one of them.
    await q.text("Late body").click();
    // The popover must still be open to swap the dialog again.
    await q.button("Swap late").click();
    await test.expect(q.dialog("Late")).toHaveJSProperty("tagName", "SECTION");
    await test.expect(q.dialog("Notes")).toBeVisible();
  });

  // https://github.com/ariakit/ariakit/issues/7734
  test("Clicking a Dialog that opened before the Popover closes the Popover after the Dialog moves out of its portal node", async ({
    q,
  }) => {
    await q.button("Open bulletin").click();
    await test.expect(q.dialog("Bulletin")).toBeVisible();
    await q.button("Open pins").click();
    await test.expect(q.dialog("Pins")).toBeVisible();
    await q.checkbox("Portal").click();
    await test.expect(q.checkbox("Portal")).not.toBeChecked();
    await test.expect(q.dialog("Pins")).toBeVisible();
    // The popover has had focus, so it ignores the elements it didn't mark, and
    // it marked the bulletin through the portal node before the bulletin moved.
    await q.text("Bulletin body").click();
    await test.expect(q.dialog("Pins")).toBeHidden();
    await test.expect(q.dialog("Bulletin")).toBeVisible();
  });

  // https://github.com/ariakit/ariakit/issues/7722
  test("Escape closes the Combobox popover before a Dialog outside its tree after the Dialog id and portal change", async ({
    page,
    q,
  }) => {
    await q.button("Open banner").click();
    await test.expect(q.dialog("Banner")).toHaveAttribute("id", "banner-empty");
    await q.combobox("Dip").focus();
    await page.keyboard.press("ArrowDown");
    await test.expect(q.listbox("Dip")).toBeVisible();
    // The field has a value, so the banner moves and gets another id.
    await page.keyboard.type("a");
    await test
      .expect(q.dialog("Banner"))
      .toHaveAttribute("id", "banner-filled");
    await test.expect(q.listbox("Dip")).toBeVisible();
    await page.keyboard.press("Escape");
    await test.expect(q.listbox("Dip")).toBeHidden();
    await test.expect(q.dialog("Banner")).toBeVisible();
    await test.expect(q.combobox("Dip")).toBeFocused();
    // The dialog is the topmost popup again, so the next Escape closes it.
    await page.keyboard.press("Escape");
    await test.expect(q.dialog("Banner")).toBeHidden();
  });
});
