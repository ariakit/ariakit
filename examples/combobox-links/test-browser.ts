import { Page, expect, test } from "@playwright/test";

const getCombobox = (page: Page) =>
  page.getByRole("combobox", { name: "Links" });
const getPopover = (page: Page) => page.locator(".popover[role='listbox']");
const getOption = (page: Page, name: string) =>
  getPopover(page).getByRole("option", { name });

const getClickModifier = async (page: Page) => {
  const isMac = await page.evaluate(() => navigator.platform.startsWith("Mac"));
  return isMac ? "Meta" : "Control";
};

test.beforeEach(async ({ page }) => {
  await page.goto("/previews/combobox-links");
});

test("click on link with mouse", async ({ page }) => {
  await expect(async () => {
    await getCombobox(page).click();
    await expect(getPopover(page)).toBeVisible();
  }).toPass();
  await getOption(page, "Ariakit.org").click();
  await expect(page).toHaveURL(/https:\/\/ariakit.org/);
});

test("click on link with middle button", async ({
  page,
  context,
  browserName,
}) => {
  await expect(async () => {
    await getCombobox(page).click();
    await expect(getPopover(page)).toBeVisible();
  }).toPass();
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
  await expect(async () => {
    await getCombobox(page).click();
    await expect(getPopover(page)).toBeVisible();
  }).toPass();
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
  await expect(async () => {
    await getCombobox(page).click();
    await expect(getPopover(page)).toBeVisible();
  }).toPass();
  const modifier = await getClickModifier(page);
  await page.keyboard.press("ArrowUp");
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
  await expect(async () => {
    await getCombobox(page).click();
    await expect(getPopover(page)).toBeVisible();
  }).toPass();
  await expect(getCombobox(page)).toHaveValue("");
  const [newPage] = await Promise.all([
    context.waitForEvent("page"),
    getOption(page, "Twitter Opens in New Tab").click(),
  ]);
  await expect(getPopover(page)).not.toBeVisible();
  await expect(getCombobox(page)).toHaveValue("");
  await expect(newPage).toHaveURL(/https:\/\/twitter.com\/ariakitjs/);
});
