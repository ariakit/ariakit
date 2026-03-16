import type { Locator, Page } from "@ariakit/test/playwright";
import { expect, query } from "@ariakit/test/playwright";
import { test } from "../test-utils.ts";

const types = ["", "select", "searchable"] as const;
const offscreenBehaviors = ["lazy", "passive"] as const;
const unmountOnHides = ["", "mounted"] as const;
const defaultValues = ["", "defaultValue"] as const;
const autoSelects = ["", "autoSelect", "autoSelect always"] as const;
const groups = ["", "group"] as const;

const labels = [
  types,
  offscreenBehaviors,
  unmountOnHides,
  defaultValues,
  autoSelects,
  groups,
]
  .reduce(
    (labels, values) =>
      labels.flatMap((label) =>
        values.map((value) => {
          const val = value ? (label ? ` ${value}` : value) : "";
          return label.concat(val);
        }),
      ),
    [""],
  )
  .filter((value) => {
    const autoSelect = value.includes("autoSelect");
    const defaultValue = value.includes("defaultValue");
    const selectOnly = value.includes("select");
    const combobox = !value.includes("searchable") && !selectOnly;
    if (autoSelect && selectOnly) return false;
    if (defaultValue && combobox) return false;
    return true;
  });

function disableAnimations(page: Page) {
  return page.addStyleTag({
    content: `
      *, *::before, *::after {
        transition: none !important;
        animation: none !important;
      }
    `,
  });
}

async function getValue(combobox: Locator) {
  return (await combobox.textContent()) || (await combobox.inputValue());
}

const defaultValue = labels.filter((value) => value.includes("defaultValue"));

for (const label of defaultValue) {
  test(`defaultValue: ${label}`, async ({ page }) => {
    const q = query(page);
    await disableAnimations(page);

    const searchable = label.includes("searchable");
    const autoSelect = label.includes("autoSelect");

    const combobox = q.combobox(label, { exact: true });
    await combobox.click();

    const defaultOption = q.option("Dominica", { exact: true });
    const previousOption = q.option("Djibouti", { exact: true });
    const typeaheadOption = q.option("Jamaica", { exact: true });
    const search = q.combobox("Search...");

    await test.step("initial focus is on the default value", async () => {
      await expect(defaultOption).toBeInViewport();
      await expect(defaultOption).toHaveAttribute("data-active-item");
      await expect(defaultOption).toHaveAttribute("aria-selected", "true");
    });

    await test.step("move with keyboard", async () => {
      await expect(previousOption).not.toHaveAttribute("data-offscreen");
      await page.keyboard.press("ArrowUp");
      await expect(defaultOption).not.toHaveAttribute("data-active-item");
      await expect(defaultOption).toHaveAttribute("aria-selected", "true");
      await expect(previousOption).toHaveAttribute("data-active-item");
      await expect(previousOption).toHaveAttribute("data-focus-visible");
      await expect(previousOption).toHaveAttribute("aria-selected", "false");
    });

    await test.step("typeahead", async () => {
      await page.keyboard.press("j");
      await expect(typeaheadOption).toHaveAttribute("aria-selected", "false");
      await expect(typeaheadOption).toBeInViewport();
      if (searchable && !autoSelect) {
        await expect(typeaheadOption).not.toHaveAttribute("data-active-item");
        await expect(search).toHaveAttribute("data-active-item");
        await page.keyboard.press("ArrowDown");
      }
      await expect(typeaheadOption).toHaveAttribute("data-active-item");
      await expect(typeaheadOption).toHaveAttribute("data-focus-visible");
    });

    await test.step("select the option", async () => {
      await page.keyboard.press("Enter");
      await expect(combobox).toHaveText("Jamaica");
      await expect(q.listbox()).not.toBeVisible();
    });
  });
}

const autoSelect = labels.filter(
  (value) =>
    value.includes("autoSelect") &&
    !value.includes("defaultValue") &&
    !value.includes("always"),
);

for (const label of autoSelect) {
  test(`autoSelect: ${label}`, async ({ page }) => {
    const q = query(page);
    await disableAnimations(page);

    const combobox = q.combobox(label, { exact: true });
    await combobox.click();

    const firstOption = q.option("Afghanistan", { exact: true });
    const typeaheadOption = q.option("Jamaica", { exact: true });
    const nextOption = q.option("Japan", { exact: true });

    await test.step("no initial focus", async () => {
      await expect(firstOption).toBeInViewport();
      await expect(firstOption).not.toHaveAttribute("data-active-item", "true");
      await expect(firstOption).not.toHaveAttribute("aria-selected", "true");
    });

    await test.step("typeahead", async () => {
      await page.keyboard.press("j");
      await expect(typeaheadOption).toBeInViewport();
      await expect(typeaheadOption).toHaveAttribute("data-active-item");
      await expect(typeaheadOption).toHaveAttribute("data-focus-visible");
      await expect(typeaheadOption).not.toHaveAttribute(
        "aria-selected",
        "true",
      );
    });

    await test.step("move with keyboard", async () => {
      await expect(nextOption).not.toHaveAttribute("data-offscreen");
      await page.keyboard.press("ArrowDown");
      await expect(nextOption).toBeInViewport();
      await expect(nextOption).toHaveAttribute("data-active-item");
      await expect(nextOption).toHaveAttribute("data-focus-visible");
      await expect(nextOption).not.toHaveAttribute("aria-selected", "true");
    });

    await test.step("select the option", async () => {
      await page.keyboard.press("Enter");
      const value = await getValue(combobox);
      expect(value).toBe("Japan");
      await expect(q.listbox()).not.toBeVisible();
    });
  });
}

const alwaysAutoSelect = labels.filter(
  (value) =>
    value.includes("autoSelect always") && !value.includes("defaultValue"),
);

for (const label of alwaysAutoSelect) {
  test(`autoSelect always: ${label}`, async ({ page }) => {
    const q = query(page);
    await disableAnimations(page);

    const combobox = q.combobox(label, { exact: true });
    await combobox.click();

    const firstOption = q.option("Afghanistan", { exact: true });
    const typeaheadOption = q.option("Jamaica", { exact: true });

    await test.step("initial focus is on the first option", async () => {
      await expect(firstOption).toBeInViewport();
      await expect(firstOption).toHaveAttribute("data-active-item");
      await expect(firstOption).not.toHaveAttribute("aria-selected", "true");
    });

    await test.step("typeahead", async () => {
      await page.keyboard.press("j");
      await expect(typeaheadOption).toBeInViewport();
      await expect(typeaheadOption).toHaveAttribute("data-active-item");
      await expect(typeaheadOption).toHaveAttribute("data-focus-visible");
      await expect(typeaheadOption).not.toHaveAttribute(
        "aria-selected",
        "true",
      );
    });

    await test.step("select the option", async () => {
      await page.keyboard.press("Enter");
      const value = await getValue(combobox);
      expect(value).toBe("Jamaica");
      await expect(q.listbox()).not.toBeVisible();
    });
  });
}

const noAutoSelect = labels.filter(
  (value) => !value.includes("autoSelect") && !value.includes("defaultValue"),
);

for (const label of noAutoSelect) {
  test(`no autoSelect: ${label}`, async ({ page }) => {
    const q = query(page);
    await disableAnimations(page);

    const combobox = q.combobox(label, { exact: true });
    await combobox.click();

    const isSelectOnly = label.includes("select");
    const firstOption = q.option("Afghanistan", { exact: true });
    const typeaheadOption = q.option("Gabon", { exact: true });

    await test.step("no initial focus", async () => {
      await expect(firstOption).toBeInViewport();
      await expect(firstOption).not.toHaveAttribute("data-active-item", "true");
      await expect(firstOption).not.toHaveAttribute("aria-selected", "true");
    });

    await test.step("scroll with page down", async () => {
      await expect(async () => {
        await page.keyboard.press("PageDown");
        await expect(firstOption).not.toBeInViewport();
      }).toPass();
    });

    await test.step("typeahead", async () => {
      await page.keyboard.press("g");
      await expect(typeaheadOption).toBeInViewport();
      if (!isSelectOnly) {
        await expect(typeaheadOption).not.toHaveAttribute("data-active-item");
        await page.keyboard.press("ArrowDown");
      }
      await expect(typeaheadOption).toHaveAttribute("data-active-item");
      await expect(typeaheadOption).not.toHaveAttribute(
        "aria-selected",
        "true",
      );
    });

    await test.step("select the option", async () => {
      await page.keyboard.press("Enter");
      const value = await getValue(combobox);
      expect(value).not.toMatch(/(g|Select\.\.\.)/);
      await expect(q.listbox()).not.toBeVisible();
    });
  });
}
