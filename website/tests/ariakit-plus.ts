import { expect, test } from "@playwright/test";
import type { BrowserContext, Page } from "@playwright/test";
import dotenv from "dotenv";

dotenv.config({ path: new URL("../.env.local", import.meta.url) });

function button(locator: Pick<Page, "getByRole">, name: string | RegExp) {
  return locator.getByRole("button", { name });
}

function link(locator: Pick<Page, "getByRole">, name: string | RegExp) {
  return locator.getByRole("link", { name });
}

function textbox(locator: Pick<Page, "getByRole">, name: string | RegExp) {
  return locator.getByRole("textbox", { name });
}

function menuitem(locator: Pick<Page, "getByRole">, name: string | RegExp) {
  return locator.getByRole("menuitem", { name });
}

function generateUserEmail() {
  return `${Math.random().toString(36).slice(2)}+clerk_test@example.com`;
}

async function fillCheckout(page: Page, assertEmail?: string) {
  const frame = page.frameLocator("[name=embedded-checkout]");
  if (assertEmail) {
    await expect(frame.getByText(assertEmail)).toBeVisible();
  }
  await textbox(frame, "Card number").fill("4242424242424242");
  await textbox(frame, "Expiration").fill("12/40");
  await textbox(frame, "CVC").fill("123");
  await textbox(frame, "Cardholder name").fill("John Doe");
  await frame.getByRole("combobox", { name: "Country" }).selectOption("Spain");
  return frame;
}

async function signUpWithPassword(page: Page) {
  await textbox(page, "Password").fill("password");
  await page.keyboard.press("Enter");
  await textbox(page, "Verification code").click();
  await page.keyboard.type("424242", { delay: 200 });
  await page.waitForURL("/");
}

async function updatePlanOnSite(
  page: Page,
  context: BrowserContext,
  plan: string,
  alternatePlan: string,
) {
  await page.goto("/plus");
  await expect(button(page, `Current plan ${plan}`)).toBeDisabled();
  await button(page, alternatePlan).click();
  const nextPage = await context.waitForEvent("page");
  await button(nextPage, "Confirm").click();
  await expect(nextPage.getByText("Plan updated")).toBeVisible();
  await nextPage.close();
  await page.reload();
  await expect(button(page, `Current plan ${alternatePlan}`)).toBeDisabled();
}

test.skip(() => !process.env.CLERK_SECRET_KEY);
expect.configure({ timeout: 10_000 });

for (const plan of ["Monthly", "Yearly"]) {
  test(`subscribe to ${plan} plan without login, then switch plans`, async ({
    page,
    context,
  }) => {
    test.setTimeout(120_000);

    await page.goto("/plus");
    await button(page, plan).click();
    const email = generateUserEmail();
    const frame = await fillCheckout(page);
    await textbox(frame, "Email").fill(email);
    await page.keyboard.press("Enter");

    await page.waitForURL(/\/sign-up\?session\-id/);
    await expect(textbox(page, "Email address")).toHaveValue(email);
    await signUpWithPassword(page);
    await button(page, "Plus").click();
    await expect(menuitem(page, "Subscription")).toBeVisible();

    const alternatePlan = plan === "Monthly" ? "Yearly" : "Monthly";
    await updatePlanOnSite(page, context, plan, alternatePlan);

    await page.goto("/components/button");
    await button(page, "Vite").click();
    await context.waitForEvent("page");
  });
}

test("sign up, then subscribe to Monthly plan", async ({ page }) => {
  test.setTimeout(90_000);

  await page.goto("/sign-up");
  const email = generateUserEmail();
  await textbox(page, "Email address").fill(email);
  await signUpWithPassword(page);
  await button(page, "Plus").click();
  await expect(menuitem(page, "Unlock Ariakit Plus")).toBeVisible();

  await page.goto("/components/button");
  await link(page, "Vite").click();

  await page.waitForURL("/plus?feature=edit-examples");
  await button(page, "Monthly").click();
  await fillCheckout(page, email);
  await page.keyboard.press("Enter");

  await page.waitForURL(/\/\?session\-id/);
  const sessionId = new URL(page.url()).searchParams.get("session-id");

  await button(page, "Plus").click();
  await expect(menuitem(page, "Subscription")).toBeVisible();
  await menuitem(page, "Sign out").click();

  await page.goto(`/sign-up?session-id=${sessionId}`);
  await expect(textbox(page, "Email address")).toHaveValue(email);
  await textbox(page, "Email address").fill(generateUserEmail());
  await signUpWithPassword(page);
  await button(page, "Plus").click();
  await expect(menuitem(page, "Unlock Ariakit Plus")).toBeVisible();
});

test("subscribe, then sign in with free account", async ({ page }) => {
  test.setTimeout(90_000);

  await page.goto("/sign-up");
  const email = generateUserEmail();
  await textbox(page, "Email address").fill(email);
  await signUpWithPassword(page);

  await button(page, "Plus").click();
  await expect(menuitem(page, "Unlock Ariakit Plus")).toBeVisible();
  await menuitem(page, "Sign out").click();

  await page.goto("/plus");
  await button(page, "Monthly").click();
  await textbox(await fillCheckout(page), "Email").fill(email);
  await page.keyboard.press("Enter");

  await page.waitForURL(/\/sign-up/);
  await link(page, "Sign in").click();

  await page.waitForURL(/\/sign-in/);
  await textbox(page, "Email address").fill(email);
  await textbox(page, "Password").fill("password");
  await page.keyboard.press("Enter");

  await page.waitForURL("/");
  await page.goto("/plus");
  await expect(button(page, "Current plan Monthly")).toBeDisabled();
});

test("subscribe, then sign in with paid account", async ({ page }) => {
  test.setTimeout(90_000);

  await page.goto("/plus");
  await button(page, "Monthly").click();
  const email = generateUserEmail();
  await textbox(await fillCheckout(page), "Email").fill(email);
  await page.keyboard.press("Enter");
  await signUpWithPassword(page);

  await button(page, "Plus").click();
  await expect(menuitem(page, "Subscription")).toBeVisible();
  await menuitem(page, "Sign out").click();

  await page.goto("/plus");
  await button(page, "Yearly").click();
  await textbox(await fillCheckout(page), "Email").fill(email);
  await page.keyboard.press("Enter");

  await page.waitForURL(/\/sign-up/);
  await link(page, "Sign in").click();

  await page.waitForURL(/\/sign-in/);
  await textbox(page, "Email address").fill(email);
  await textbox(page, "Password").fill("password");
  await page.keyboard.press("Enter");

  await page.waitForURL("/");
  await page.goto("/plus");
  await expect(button(page, "Current plan Monthly")).toBeDisabled();
});
