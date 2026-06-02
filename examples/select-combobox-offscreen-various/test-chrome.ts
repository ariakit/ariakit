import type { Locator, Page } from "@ariakit/test/playwright";
import { expect, query } from "@ariakit/test/playwright";
import { test } from "../test-utils.ts";

const types = ["", "select", "searchable"] as const;
const offscreenModes = ["lazy", "passive"] as const;
const unmountOnHides = ["", "mounted"] as const;
const defaultValues = ["", "defaultValue"] as const;
const autoSelects = ["", "autoSelect", "autoSelect always"] as const;
const groups = ["", "group"] as const;

const labels = [
  types,
  offscreenModes,
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

const leakedAttributes = [
  "accessiblewhendisabled",
  "autofocus",
  "clickonenter",
  "clickonspace",
  "bluronhoverend",
  "focusable",
  "focusonhover",
  "moveonkeypress",
  "onfocusvisible",
  "preventscrollonkeydown",
  "rowid",
  "shouldregisteritem",
  "tabbable",
];

async function expectNoLeakedAttributes(item: Locator) {
  for (const attribute of leakedAttributes) {
    await expect(item).not.toHaveAttribute(attribute);
  }
}

test("offscreen placeholders omit item-only DOM props", async ({ page }) => {
  const q = query(page);
  const warnings: string[] = [];
  page.on("console", (message) => {
    const text = message.text();
    if (
      /React does not recognize|Invalid DOM property|Received `(?:true|false)` for a non-boolean attribute|Unknown event handler property/.test(
        text,
      )
    ) {
      warnings.push(text);
    }
  });
  await page.reload({ waitUntil: "networkidle" });
  await disableAnimations(page);

  await test.step("select combobox offscreen render props", async () => {
    const combobox = q.combobox("offscreen props searchable", { exact: true });
    await combobox.click();
    const listbox = q.listbox();
    const disabledItem = listbox.locator(
      '[data-testid="select-combobox-offscreen-disabled"][data-offscreen]',
    );
    const autofocusItem = listbox.locator(
      '[data-testid="select-combobox-offscreen-autofocus"][data-offscreen]',
    );
    const divItem = listbox.locator(
      '[data-testid="select-combobox-offscreen-div"][data-offscreen]',
    );
    const callbackDisabledItem = listbox.locator(
      '[data-testid="select-combobox-offscreen-callback-disabled"][data-offscreen]',
    );
    const callbackPropDisabledItem = listbox.locator(
      '[data-testid="select-combobox-offscreen-callback-prop-disabled"][data-offscreen]',
    );
    const elementPropDisabledItem = listbox.locator(
      '[data-testid="select-combobox-offscreen-element-prop-disabled"][data-offscreen]',
    );
    const customDivDisabledItem = listbox.locator(
      '[data-testid="select-combobox-offscreen-custom-div-disabled"][data-offscreen]',
    );

    await expect(disabledItem).toHaveAttribute("data-offscreen");
    await expect(disabledItem).toHaveAttribute("aria-disabled", "true");
    await expect(disabledItem).toHaveAttribute("disabled");
    await expectNoLeakedAttributes(disabledItem);

    await expect(autofocusItem).toHaveAttribute("data-offscreen");
    await expect(autofocusItem).not.toBeFocused();
    await expectNoLeakedAttributes(autofocusItem);

    await expect(divItem).toHaveAttribute("data-offscreen");
    await expect(divItem).toHaveAttribute("aria-disabled", "true");
    await expect(divItem).not.toHaveAttribute("disabled");
    await expectNoLeakedAttributes(divItem);

    await expect(callbackDisabledItem).toHaveAttribute("data-offscreen");
    await expect(callbackDisabledItem).toHaveAttribute("disabled");
    await expectNoLeakedAttributes(callbackDisabledItem);

    await expect(callbackPropDisabledItem).toHaveAttribute("data-offscreen");
    await expect(callbackPropDisabledItem).toHaveAttribute(
      "aria-disabled",
      "true",
    );
    await expect(callbackPropDisabledItem).toHaveAttribute("disabled");
    await expectNoLeakedAttributes(callbackPropDisabledItem);

    await expect(elementPropDisabledItem).toHaveAttribute("data-offscreen");
    await expect(elementPropDisabledItem).toHaveAttribute(
      "aria-disabled",
      "true",
    );
    await expect(elementPropDisabledItem).toHaveAttribute("disabled");
    await expectNoLeakedAttributes(elementPropDisabledItem);

    await expect(customDivDisabledItem).toHaveAttribute("data-offscreen");
    await expect(customDivDisabledItem).toHaveAttribute(
      "aria-disabled",
      "true",
    );
    await expect(customDivDisabledItem).not.toHaveAttribute("disabled");
    await expectNoLeakedAttributes(customDivDisabledItem);

    await page.keyboard.press("Escape");
  });

  await test.step("combobox offscreen render props", async () => {
    const combobox = q.combobox("offscreen props combobox", { exact: true });
    await combobox.click();
    const listbox = q.listbox();
    const disabledItem = listbox.locator(
      '[data-testid="combobox-offscreen-disabled"][data-offscreen]',
    );
    const autofocusItem = listbox.locator(
      '[data-testid="combobox-offscreen-autofocus"][data-offscreen]',
    );
    const divItem = listbox.locator(
      '[data-testid="combobox-offscreen-div"][data-offscreen]',
    );
    const callbackDisabledItem = listbox.locator(
      '[data-testid="combobox-offscreen-callback-disabled"][data-offscreen]',
    );
    const callbackPropDisabledItem = listbox.locator(
      '[data-testid="combobox-offscreen-callback-prop-disabled"][data-offscreen]',
    );
    const elementPropDisabledItem = listbox.locator(
      '[data-testid="combobox-offscreen-element-prop-disabled"][data-offscreen]',
    );
    const customDivDisabledItem = listbox.locator(
      '[data-testid="combobox-offscreen-custom-div-disabled"][data-offscreen]',
    );

    await expect(disabledItem).toHaveAttribute("data-offscreen");
    await expect(disabledItem).toHaveAttribute("aria-disabled", "true");
    await expect(disabledItem).toHaveAttribute("disabled");
    await expectNoLeakedAttributes(disabledItem);

    await expect(autofocusItem).toHaveAttribute("data-offscreen");
    await expect(autofocusItem).not.toBeFocused();
    await expectNoLeakedAttributes(autofocusItem);

    await expect(divItem).toHaveAttribute("data-offscreen");
    await expect(divItem).toHaveAttribute("aria-disabled", "true");
    await expect(divItem).not.toHaveAttribute("disabled");
    await expectNoLeakedAttributes(divItem);

    await expect(callbackDisabledItem).toHaveAttribute("data-offscreen");
    await expect(callbackDisabledItem).toHaveAttribute("disabled");
    await expectNoLeakedAttributes(callbackDisabledItem);

    await expect(callbackPropDisabledItem).toHaveAttribute("data-offscreen");
    await expect(callbackPropDisabledItem).toHaveAttribute(
      "aria-disabled",
      "true",
    );
    await expect(callbackPropDisabledItem).toHaveAttribute("disabled");
    await expectNoLeakedAttributes(callbackPropDisabledItem);

    await expect(elementPropDisabledItem).toHaveAttribute("data-offscreen");
    await expect(elementPropDisabledItem).toHaveAttribute(
      "aria-disabled",
      "true",
    );
    await expect(elementPropDisabledItem).toHaveAttribute("disabled");
    await expectNoLeakedAttributes(elementPropDisabledItem);

    await expect(customDivDisabledItem).toHaveAttribute("data-offscreen");
    await expect(customDivDisabledItem).toHaveAttribute(
      "aria-disabled",
      "true",
    );
    await expect(customDivDisabledItem).not.toHaveAttribute("disabled");
    await expectNoLeakedAttributes(customDivDisabledItem);
  });

  expect(warnings).toEqual([]);
});

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
