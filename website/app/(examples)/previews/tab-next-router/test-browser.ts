import type { Page } from "@playwright/test";
import { expect, test } from "@playwright/test";

const getLink = (page: Page, name: string) => page.getByRole("link", { name });

const getTab = (page: Page, name: string) => page.getByRole("tab", { name });

const getTabPanel = (page: Page, name: string) =>
  page.getByRole("tabpanel", { name });

test.beforeEach(async ({ page }) => {
  await page.goto("/previews/tab-next-router", { waitUntil: "networkidle" });
});

test("click on links", async ({ page }) => {
  await expect(getTabPanel(page, "Hot")).toBeVisible();
  await getLink(page, "latest posts").click();
  await expect(page).toHaveURL("/previews/tab-next-router/new");
  await expect(getTabPanel(page, "Hot")).not.toBeVisible();
  await expect(getTabPanel(page, "New")).toBeVisible();
  await getLink(page, "trending posts").click();
  await expect(page).toHaveURL("/previews/tab-next-router");
  await expect(getTabPanel(page, "Hot")).toBeVisible();
  await expect(getTabPanel(page, "New")).not.toBeVisible();
});

test("click on tabs", async ({ page }) => {
  await expect(getTabPanel(page, "Hot")).toBeVisible();
  await getTab(page, "New").click();
  await expect(page).toHaveURL("/previews/tab-next-router/new");
  await expect(getTabPanel(page, "Hot")).not.toBeVisible();
  await expect(getTabPanel(page, "New")).toBeVisible();
  await expect(getTab(page, "New")).toBeFocused();
  await getTab(page, "Hot").click();
  await expect(page).toHaveURL("/previews/tab-next-router");
  await expect(getTabPanel(page, "Hot")).toBeVisible();
  await expect(getTabPanel(page, "New")).not.toBeVisible();
  await expect(getTab(page, "Hot")).toBeFocused();
});

test("select tabs with keyboard", async ({ page }) => {
  await getTab(page, "Hot").press("ArrowRight");
  await expect(getTab(page, "New")).toBeFocused();
  // Manual tabs
  // await expect(getTabPanel(page, "Hot")).toBeVisible();
  // await expect(getTabPanel(page, "New")).not.toBeVisible();
  // await page.keyboard.press("Enter");
  await expect(getTabPanel(page, "Hot")).not.toBeVisible();
  await expect(getTabPanel(page, "New")).toBeVisible();
  await expect(getTab(page, "New")).toBeFocused();
  await page.keyboard.press("ArrowLeft");
  await expect(getTab(page, "Hot")).toBeFocused();
  // Manual tabs
  // await expect(getTabPanel(page, "Hot")).not.toBeVisible();
  // await expect(getTabPanel(page, "New")).toBeVisible();
  // await page.keyboard.press("Enter");
  await expect(getTabPanel(page, "Hot")).toBeVisible();
  await expect(getTabPanel(page, "New")).not.toBeVisible();
  await expect(getTab(page, "Hot")).toBeFocused();
});

test("select tabs with the browser history", async ({ page }) => {
  await page.goto("/previews/tab-next-router/new");
  await expect(getTabPanel(page, "Hot")).not.toBeVisible();
  await expect(getTabPanel(page, "New")).toBeVisible();
  await page.goto("/previews/tab-next-router");
  await expect(getTabPanel(page, "Hot")).toBeVisible();
  await expect(getTabPanel(page, "New")).not.toBeVisible();
  await page.goBack();
  await expect(getTabPanel(page, "Hot")).not.toBeVisible();
  await expect(getTabPanel(page, "New")).toBeVisible();
  await page.goForward();
  await expect(getTabPanel(page, "Hot")).toBeVisible();
  await expect(getTabPanel(page, "New")).not.toBeVisible();
});
