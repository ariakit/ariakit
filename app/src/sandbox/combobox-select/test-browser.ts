import { expect } from "@playwright/test";
import { withFramework } from "#app/test-utils/preview.ts";

withFramework(import.meta.dirname, async ({ test }) => {
  test("uses the popover heading as the popover label", async ({ q }) => {
    await q.combobox("Heading fruit").click();

    await expect(q.dialog("Available fruits")).toBeVisible();
    await expect(q.dialog("Heading fruit")).toBeHidden();
  });

  test("keeps the select in the modal context", async ({ q }) => {
    const outside = q.button("Outside action");
    await q.combobox("Modal fruit").click();
    await expect(q.dialog("Modal fruit")).toBeVisible();

    await expect(outside).toHaveJSProperty("inert", true);
    await expect(q.combobox("Modal fruit")).toHaveJSProperty("inert", false);
    await expect(q.combobox("Modal fruit")).not.toHaveAttribute("aria-hidden");
  });

  test("submits and forwards native select interactions", async ({
    page,
    q,
  }) => {
    await q.combobox("Favorite fruit").click();
    await q.option("Banana").click();
    await q.button("Submit favorite").click();
    await expect(q.text("Favorite submitted: Banana")).toBeVisible();

    const select = page.locator("select[name='fruit']");

    await select.evaluate((element) => {
      if (!(element instanceof HTMLSelectElement)) return;
      const select = element;
      select.value = "Orange";
      select.dispatchEvent(new Event("change", { bubbles: true }));
    });

    await expect(q.combobox("Favorite fruit")).toContainText("Orange");
    await expect(q.combobox("Favorite fruit")).toHaveAttribute(
      "data-autofill",
      "true",
    );

    await select.evaluate((element) => {
      if (!(element instanceof HTMLSelectElement)) return;
      element.focus();
    });

    await expect(q.combobox("Favorite fruit")).toBeFocused();
  });

  test("opens anchored to the select with the keyboard", async ({
    page,
    q,
  }) => {
    await q.combobox("Favorite fruit").focus();
    await page.keyboard.press("ArrowDown");
    await expect(q.dialog("Favorite fruit")).toBeVisible();

    const selectBox = await q.combobox("Favorite fruit").boundingBox();
    const dialogBox = await q.dialog("Favorite fruit").boundingBox();
    expect(selectBox).toBeTruthy();
    expect(dialogBox).toBeTruthy();
    if (!selectBox) return;
    if (!dialogBox) return;

    // The popover must be positioned relative to the select button rather
    // than the top-left corner of the viewport, which is where it would land
    // if the anchor element was missing.
    expect(dialogBox.y).toBeGreaterThan(selectBox.y);
    expect(Math.abs(dialogBox.x - selectBox.x)).toBeLessThan(
      selectBox.width + dialogBox.width,
    );
  });

  test("keeps the popover anchored to the input after the select unmounts", async ({
    q,
  }) => {
    await q.button("Toggle select").click();
    await q.combobox("Search Toggle fruit").click();
    await expect(q.dialog("Toggle fruit popover")).toBeVisible();

    const inputBox = await q.combobox("Search Toggle fruit").boundingBox();
    const dialogBox = await q.dialog("Toggle fruit popover").boundingBox();
    expect(inputBox).toBeTruthy();
    expect(dialogBox).toBeTruthy();
    if (!inputBox) return;
    if (!dialogBox) return;

    // The anchor element must be restored to the combobox input when the
    // select unmounts, so the popover opens adjacent to the input rather than
    // at the top-left corner of the viewport.
    expect(Math.abs(dialogBox.y - inputBox.y)).toBeLessThan(
      dialogBox.height + inputBox.height + 16,
    );
  });

  test("supports required validation", async ({ page, q }) => {
    await q.button("Submit required").click();

    const requiredSelect = page.locator("select[name='requiredFruit']");

    await expect(q.text("Required submitted: yes")).toBeHidden();
    const isValid = await requiredSelect.evaluate((element) => {
      if (!(element instanceof HTMLSelectElement)) return true;
      return element.validity.valid;
    });
    expect(isValid).toBe(false);
  });

  test("supports multiple values, fallback, keyboard, click, and disabled props", async ({
    page,
    q,
  }) => {
    const multipleSelect = page.locator("select[name='multipleFruit']");

    await expect(multipleSelect).toHaveJSProperty("multiple", true);
    await expect(q.combobox("Multiple fruit")).toContainText("Apple, Banana");

    await q.combobox("Multiple fruit").click();
    await q.option("Orange").click();

    await expect(q.combobox("Multiple fruit")).toContainText(
      "Apple, Banana, Orange",
    );

    await expect(q.combobox("Empty fruit")).toContainText("Choose fruit");

    await q.combobox("Keyboard fruit").focus();
    await page.keyboard.press("ArrowDown");
    await expect(q.dialog("Keyboard fruit")).toBeHidden();

    await q.combobox("Click fruit").click();
    await expect(q.dialog("Click fruit")).toBeHidden();

    await expect(q.combobox("Disabled fruit")).toBeDisabled();
    await expect(page.locator("select[name='disabledFruit']")).toHaveJSProperty(
      "disabled",
      true,
    );
    await q.combobox("Disabled fruit").dispatchEvent("click");
    await expect(q.dialog("Disabled fruit")).toBeHidden();
  });
});
