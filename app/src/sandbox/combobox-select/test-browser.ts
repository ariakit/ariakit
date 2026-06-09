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
