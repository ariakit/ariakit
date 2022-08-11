import { Page, expect, test } from "@playwright/test";

const getCombobox = (page: Page) => page.locator("role=combobox[name='Links']");
const getPopover = (page: Page) => page.locator(".popover[role='listbox']");
const getOption = (page: Page, name: string) =>
  getPopover(page).locator(`role=option[name='${name}']`);

const getClickModifier = async (page: Page) => {
  const isMac = await page.evaluate(() => navigator.platform.startsWith("Mac"));
  return isMac ? "Meta" : "Control";
};

test("click on link with mouse", async ({ page }) => {
  await page.goto("/examples/combobox-links");
  await getCombobox(page).click();
  await getOption(page, "Ariakit.org").click();
  await expect(page).toHaveURL(/https:\/\/ariakit.org/);
});

test("click on link with middle button", async ({
  page,
  context,
  browserName,
}) => {
  await page.goto("/examples/combobox-links");
  await getCombobox(page).click();
  await expect(getCombobox(page)).toHaveValue("");
  if (browserName === "webkit") {
    await getOption(page, "Ariakit.org").click({ button: "middle" });
    await expect(page).toHaveURL(/https:\/\/ariakit.org/);
  } else {
    const [newPage] = await Promise.all([
      context.waitForEvent("page"),
      getOption(page, "Ariakit.org").click({ button: "middle" }),
    ]);
    await expect(getPopover(page)).toBeVisible();
    await expect(getCombobox(page)).toHaveValue("");
    await expect(newPage).toHaveURL(/https:\/\/ariakit.org/);
  }
});

test("click on link with cmd/ctrl", async ({ page, context }) => {
  await page.goto("/examples/combobox-links");
  await getCombobox(page).click();
  const modifier = await getClickModifier(page);
  const [newPage] = await Promise.all([
    context.waitForEvent("page"),
    getOption(page, "Ariakit.org").click({ modifiers: [modifier] }),
  ]);
  await expect(getPopover(page)).toBeVisible();
  await expect(getCombobox(page)).toHaveValue("");
  await expect(newPage).toHaveURL(/https:\/\/ariakit.org/);
});

test("click on link with cmd/ctrl + enter", async ({
  page,
  context,
  browserName,
}) => {
  await page.goto("/examples/combobox-links");
  await getCombobox(page).click();
  const modifier = await getClickModifier(page);
  await page.keyboard.press("ArrowDown");
  // Safari doesn't support Cmd+Enter to open a link in a new tab
  // programmatically.
  if (browserName === "webkit") {
    await page.keyboard.press(`${modifier}+Enter`);
    await expect(page).toHaveURL(/https:\/\/ariakit.org/);
  } else {
    const [newPage] = await Promise.all([
      context.waitForEvent("page"),
      page.keyboard.press(`${modifier}+Enter`),
    ]);
    await expect(getPopover(page)).toBeVisible();
    await expect(getCombobox(page)).toHaveValue("");
    await expect(newPage).toHaveURL(/https:\/\/ariakit.org/);
  }
});

test("click on target blank link", async ({ page, context }) => {
  await page.goto("/examples/combobox-links");
  await getCombobox(page).click();
  await expect(getCombobox(page)).toHaveValue("");
  const [newPage] = await Promise.all([
    context.waitForEvent("page"),
    getOption(page, "Twitter").click(),
  ]);
  await expect(getPopover(page)).not.toBeVisible();
  await expect(getCombobox(page)).toHaveValue("Twitter");
  await expect(newPage).toHaveURL(/https:\/\/twitter.com\/ariakitjs/);
});
