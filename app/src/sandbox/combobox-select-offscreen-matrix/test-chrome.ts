import type { Locator, Page } from "@playwright/test";
import { expect } from "@playwright/test";
import { flushFrames, withFramework } from "#app/test-utils/preview.ts";
import { getCaseLabel, matrixCases } from "./config.react.ts";

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

async function renderMatrixCase(page: Page, label: string) {
  await page.getByRole("combobox", { name: "Matrix case" }).selectOption(label);
}

async function waitForItemRegistration(page: Page, item: Locator) {
  await expect(item).not.toHaveAttribute("data-offscreen");
  // Offscreen items register in an effect. The collection publishes those
  // registrations on the following animation frame, so wait through both
  // render checkpoints.
  await flushFrames(page);
}

const leakedAttributes = [
  "accessiblewhendisabled",
  "autofocus",
  "bluronhoverend",
  "clickonenter",
  "clickonspace",
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

interface OffscreenProbeLocators {
  autofocusItem: Locator;
  callbackDisabledItem: Locator;
  disabledItem: Locator;
  divDisabledItem: Locator;
  elementDisabledItem: Locator;
}

async function expectOffscreenProbeLocators({
  autofocusItem,
  callbackDisabledItem,
  disabledItem,
  divDisabledItem,
  elementDisabledItem,
}: OffscreenProbeLocators) {
  await expect(disabledItem).toHaveAttribute("data-offscreen");
  await expect(disabledItem).toHaveAttribute("aria-disabled", "true");
  await expect(disabledItem).not.toHaveAttribute("disabled");
  await expectNoLeakedAttributes(disabledItem);

  await expect(autofocusItem).toHaveAttribute("data-offscreen");
  await expect(autofocusItem).not.toBeFocused();
  await expectNoLeakedAttributes(autofocusItem);

  await expect(divDisabledItem).toHaveAttribute("data-offscreen");
  await expect(divDisabledItem).toHaveAttribute("aria-disabled", "true");
  await expect(divDisabledItem).not.toHaveAttribute("disabled");
  await expectNoLeakedAttributes(divDisabledItem);

  await expect(callbackDisabledItem).toHaveAttribute("data-offscreen");
  await expect(callbackDisabledItem).toHaveAttribute("aria-disabled", "true");
  await expect(callbackDisabledItem).toHaveAttribute("disabled");
  await expectNoLeakedAttributes(callbackDisabledItem);

  await expect(elementDisabledItem).toHaveAttribute("data-offscreen");
  await expect(elementDisabledItem).toHaveAttribute("aria-disabled", "true");
  await expect(elementDisabledItem).toHaveAttribute("disabled");
  await expectNoLeakedAttributes(elementDisabledItem);
}

const defaultValueCases = matrixCases.filter(
  (matrixCase) => matrixCase.defaultValue === "Dominica",
);
const autoSelectCases = matrixCases.filter(
  (matrixCase) =>
    matrixCase.autoSelect === true && matrixCase.defaultValue !== "Dominica",
);
const alwaysAutoSelectCases = matrixCases.filter(
  (matrixCase) =>
    matrixCase.autoSelect === "always" &&
    matrixCase.defaultValue !== "Dominica",
);
const noAutoSelectCases = matrixCases.filter(
  (matrixCase) =>
    !matrixCase.autoSelect && matrixCase.defaultValue !== "Dominica",
);

withFramework(import.meta.dirname, async ({ query, test }) => {
  test("offscreen placeholders omit item-only DOM props", async ({
    page,
    q,
  }) => {
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
      await q.combobox("offscreen props searchable").click();
      const listboxQuery = query(q.listbox());
      await expectOffscreenProbeLocators({
        disabledItem: listboxQuery.button("Disabled offscreen button"),
        autofocusItem: listboxQuery.button("Autofocus offscreen button"),
        divDisabledItem: listboxQuery.option("Disabled offscreen div"),
        callbackDisabledItem: listboxQuery.button(
          "Callback disabled offscreen button",
        ),
        elementDisabledItem: listboxQuery.button(
          "Element disabled offscreen button",
        ),
      });
      await page.keyboard.press("Escape");
    });

    await test.step("combobox offscreen render props", async () => {
      await q.combobox("offscreen props combobox").click();
      const listboxQuery = query(q.listbox());
      await expectOffscreenProbeLocators({
        disabledItem: listboxQuery.option("Disabled offscreen button"),
        autofocusItem: listboxQuery.option("Autofocus offscreen button"),
        divDisabledItem: listboxQuery.option("Disabled offscreen div"),
        callbackDisabledItem: listboxQuery.option(
          "Callback disabled offscreen button",
        ),
        elementDisabledItem: listboxQuery.option(
          "Element disabled offscreen button",
        ),
      });
    });

    expect(warnings).toEqual([]);
  });

  for (const matrixCase of defaultValueCases) {
    const label = getCaseLabel(matrixCase);
    test(`defaultValue: ${label}`, async ({ page, q }) => {
      await disableAnimations(page);
      await renderMatrixCase(page, label);
      const searchable = matrixCase.type === "searchable";
      const autoSelect = !!matrixCase.autoSelect;
      const combobox = q.combobox(label);
      await combobox.click();
      await expect(combobox).toHaveAttribute("aria-expanded", "true");
      await page.mouse.move(0, 0);

      const defaultOption = q.option("Dominica");
      const previousOption = q.option("Djibouti");
      const typeaheadOption = q.option("Jamaica");
      const search = q.combobox("Search...");
      const keyboardTarget = searchable ? search : combobox;

      await test.step("initial focus is on the default value", async () => {
        await expect(defaultOption).toBeInViewport();
        await expect(defaultOption).toHaveAttribute("data-active-item");
        await expect(defaultOption).toHaveAttribute("aria-selected", "true");
      });

      await test.step("move with keyboard", async () => {
        await waitForItemRegistration(page, previousOption);
        await expect(defaultOption).toHaveAttribute("data-active-item");
        await expect(keyboardTarget).toBeFocused();
        await keyboardTarget.press("ArrowUp");
        await expect(defaultOption).not.toHaveAttribute("data-active-item");
        await expect(defaultOption).toHaveAttribute("aria-selected", "true");
        await expect(previousOption).toHaveAttribute("data-active-item");
        await expect(previousOption).toHaveAttribute("data-focus-visible");
        await expect(previousOption).toHaveAttribute("aria-selected", "false");
      });

      await test.step("typeahead", async () => {
        await expect(keyboardTarget).toBeFocused();
        await keyboardTarget.press("j");
        await expect(typeaheadOption).toHaveAttribute("aria-selected", "false");
        await expect(typeaheadOption).toBeInViewport();
        if (searchable && !autoSelect) {
          await expect(typeaheadOption).not.toHaveAttribute("data-active-item");
          await expect(search).toHaveAttribute("data-active-item");
          await waitForItemRegistration(page, typeaheadOption);
          await keyboardTarget.press("ArrowDown");
        }
        await expect(typeaheadOption).toHaveAttribute("data-active-item");
        await expect(typeaheadOption).toHaveAttribute("data-focus-visible");
      });

      await test.step("select the option", async () => {
        await expect(keyboardTarget).toBeFocused();
        await keyboardTarget.press("Enter");
        await expect(combobox).toHaveText("Jamaica");
        await expect(q.listbox()).not.toBeVisible();
      });
    });
  }

  for (const matrixCase of autoSelectCases) {
    const label = getCaseLabel(matrixCase);
    test(`autoSelect: ${label}`, async ({ page, q }) => {
      await disableAnimations(page);
      await renderMatrixCase(page, label);
      const searchable = matrixCase.type === "searchable";
      const combobox = q.combobox(label);
      await combobox.click();
      await expect(combobox).toHaveAttribute("aria-expanded", "true");
      await page.mouse.move(0, 0);
      const keyboardTarget = searchable ? q.combobox("Search...") : combobox;

      const firstOption = q.option("Afghanistan");
      const typeaheadOption = q.option("Jamaica");
      const nextOption = q.option("Japan");

      await test.step("no initial focus", async () => {
        await expect(firstOption).toBeInViewport();
        await expect(firstOption).not.toHaveAttribute("data-active-item");
        await expect(firstOption).not.toHaveAttribute("aria-selected", "true");
      });

      await test.step("typeahead", async () => {
        await expect(keyboardTarget).toBeFocused();
        await keyboardTarget.press("j");
        await expect(firstOption).toHaveCount(0);
        await expect(typeaheadOption).toBeInViewport();
        await expect(typeaheadOption).toHaveAttribute("data-active-item");
        await expect(typeaheadOption).toHaveAttribute("data-focus-visible");
        await expect(typeaheadOption).not.toHaveAttribute(
          "aria-selected",
          "true",
        );
      });

      await test.step("move with keyboard", async () => {
        await waitForItemRegistration(page, nextOption);
        await expect(typeaheadOption).toHaveAttribute("data-active-item");
        await expect(keyboardTarget).toBeFocused();
        await keyboardTarget.press("ArrowDown");
        await expect(nextOption).toBeInViewport();
        await expect(nextOption).toHaveAttribute("data-active-item");
        await expect(nextOption).toHaveAttribute("data-focus-visible");
        await expect(nextOption).not.toHaveAttribute("aria-selected", "true");
      });

      await test.step("select the option", async () => {
        await expect(keyboardTarget).toBeFocused();
        await keyboardTarget.press("Enter");
        expect(await getValue(combobox)).toBe("Japan");
        await expect(q.listbox()).not.toBeVisible();
      });
    });
  }

  for (const matrixCase of alwaysAutoSelectCases) {
    const label = getCaseLabel(matrixCase);
    test(`autoSelect always: ${label}`, async ({ page, q }) => {
      await disableAnimations(page);
      await renderMatrixCase(page, label);
      const searchable = matrixCase.type === "searchable";
      const combobox = q.combobox(label);
      await combobox.click();
      await expect(combobox).toHaveAttribute("aria-expanded", "true");
      await page.mouse.move(0, 0);
      const keyboardTarget = searchable ? q.combobox("Search...") : combobox;

      const firstOption = q.option("Afghanistan");
      const typeaheadOption = q.option("Jamaica");

      await test.step("initial focus is on the first option", async () => {
        await expect(firstOption).toBeInViewport();
        await expect(firstOption).toHaveAttribute("data-active-item");
        await expect(firstOption).not.toHaveAttribute("aria-selected", "true");
      });

      await test.step("typeahead", async () => {
        await expect(keyboardTarget).toBeFocused();
        await keyboardTarget.press("j");
        await expect(firstOption).toHaveCount(0);
        await expect(typeaheadOption).toBeInViewport();
        await expect(typeaheadOption).toHaveAttribute("data-active-item");
        await expect(typeaheadOption).toHaveAttribute("data-focus-visible");
        await expect(typeaheadOption).not.toHaveAttribute(
          "aria-selected",
          "true",
        );
      });

      await test.step("select the option", async () => {
        await expect(keyboardTarget).toBeFocused();
        await keyboardTarget.press("Enter");
        expect(await getValue(combobox)).toBe("Jamaica");
        await expect(q.listbox()).not.toBeVisible();
      });
    });
  }

  for (const matrixCase of noAutoSelectCases) {
    const label = getCaseLabel(matrixCase);
    test(`no autoSelect: ${label}`, async ({ page, q }) => {
      await disableAnimations(page);
      await renderMatrixCase(page, label);
      const combobox = q.combobox(label);
      await combobox.click();
      await expect(combobox).toHaveAttribute("aria-expanded", "true");
      await page.mouse.move(0, 0);

      const selectOnly = matrixCase.type === "select";
      const keyboardTarget =
        matrixCase.type === "searchable" ? q.combobox("Search...") : combobox;
      const firstOption = q.option("Afghanistan");
      const filteredOption = q.option("Albania");
      const typeaheadOption = q.option("Gabon");

      await test.step("no initial focus", async () => {
        await expect(firstOption).toBeInViewport();
        await expect(firstOption).not.toHaveAttribute("data-active-item");
        await expect(firstOption).not.toHaveAttribute("aria-selected", "true");
      });

      await test.step("scroll with page down", async () => {
        await expect(keyboardTarget).toBeFocused();
        await expect(async () => {
          await keyboardTarget.press("PageDown");
          await expect(firstOption).not.toBeInViewport();
        }).toPass();
      });

      await test.step("typeahead", async () => {
        await expect(keyboardTarget).toBeFocused();
        await keyboardTarget.press("g");
        if (!selectOnly) {
          await expect(filteredOption).toHaveCount(0);
        }
        await expect(typeaheadOption).toBeInViewport();
        if (!selectOnly) {
          await expect(typeaheadOption).not.toHaveAttribute("data-active-item");
          await waitForItemRegistration(page, typeaheadOption);
          await keyboardTarget.press("ArrowDown");
        }
        await expect(typeaheadOption).toHaveAttribute("data-active-item");
        await expect(typeaheadOption).not.toHaveAttribute(
          "aria-selected",
          "true",
        );
      });

      await test.step("select the option", async () => {
        await expect(keyboardTarget).toBeFocused();
        await keyboardTarget.press("Enter");
        expect(await getValue(combobox)).not.toMatch(/(g|Select\.\.\.)/);
        await expect(q.listbox()).not.toBeVisible();
      });
    });
  }
});
