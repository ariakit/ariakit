import { createClerkClient } from "@clerk/clerk-sdk-node";
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
  await page.keyboard.type("424242424242424242424242", { delay: 250 });
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
  const pagePromise = context.waitForEvent("page");
  await button(page, alternatePlan).click();
  const nextPage = await pagePromise;
  await button(nextPage, /^(Confirm|Subscribe and pay)/).click();
  await expect(nextPage.getByText("Plan updated")).toBeVisible();
  await nextPage.close();
  await page.reload();
  await expect(button(page, `Current plan ${alternatePlan}`)).toBeDisabled();
}

const users = new Set<string>();

async function addCurrentUser(page: Page) {
  const id = await page.evaluate(() => window.Clerk?.user?.id);
  if (!id) return;
  users.add(id);
}

test.skip(() => !process.env.CLERK_SECRET_KEY);

test.afterEach(async ({ page }) => {
  const id = await page.evaluate(async () => {
    const user = window.Clerk?.user;
    if (!user) return;
    await user.delete();
    return user.id;
  });
  if (!id) return;
  users.delete(id);
});

test.afterAll(async () => {
  const clerk = createClerkClient({ secretKey: process.env.CLERK_SECRET_KEY });
  await Promise.all(
    Array.from(users).map((user) => clerk.users.deleteUser(user)),
  );
});

for (const plan of ["Monthly", "Yearly"]) {
  test(`subscribe to ${plan} plan without login, then switch plans`, async ({
    page,
    context,
  }) => {
    test.setTimeout(100_000);

    await page.goto("/plus", { waitUntil: "networkidle" });
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
    const pagePromise = context.waitForEvent("page");
    await button(page, "Vite").click();
    await pagePromise;
  });
}

test("sign up, then subscribe to Monthly plan", async ({ page }) => {
  test.setTimeout(80_000);

  await page.goto("/sign-up", { waitUntil: "networkidle" });
  const email = generateUserEmail();
  await textbox(page, "Email address").fill(email);
  await signUpWithPassword(page);
  await button(page, "Plus").click();
  await expect(menuitem(page, "Unlock Ariakit Plus")).toBeVisible();

  await page.goto("/components/button", { waitUntil: "networkidle" });
  await link(page, "Vite").click();

  await page.waitForURL("/plus?feature=edit-examples");
  await button(page, "Monthly").click();
  await fillCheckout(page, email);
  await page.keyboard.press("Enter");

  await page.waitForURL(/\/\?session\-id/);
  const sessionId = new URL(page.url()).searchParams.get("session-id");

  await button(page, "Plus").click();
  await expect(menuitem(page, "Subscription")).toBeVisible();
  await addCurrentUser(page);
  await menuitem(page, "Sign out").click();

  await page.goto(`/sign-up?session-id=${sessionId}`);
  await expect(textbox(page, "Email address")).toHaveValue(email);
  await textbox(page, "Email address").fill(generateUserEmail());
  await signUpWithPassword(page);
  await button(page, "Plus").click();
  await expect(menuitem(page, "Unlock Ariakit Plus")).toBeVisible();
});

test("subscribe, then sign in with free account", async ({ page }) => {
  test.setTimeout(80_000);

  await page.goto("/sign-up", { waitUntil: "networkidle" });
  const email = generateUserEmail();
  await textbox(page, "Email address").fill(email);
  await signUpWithPassword(page);

  await button(page, "Plus").click();
  await expect(menuitem(page, "Unlock Ariakit Plus")).toBeVisible();
  await menuitem(page, "Sign out").click();

  await page.goto("/plus", { waitUntil: "networkidle" });
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
  test.setTimeout(80_000);

  await page.goto("/plus", { waitUntil: "networkidle" });
  await button(page, "Monthly").click();
  const email = generateUserEmail();
  await textbox(await fillCheckout(page), "Email").fill(email);
  await page.keyboard.press("Enter");
  await signUpWithPassword(page);

  await button(page, "Plus").click();
  await expect(menuitem(page, "Subscription")).toBeVisible();
  await menuitem(page, "Sign out").click();

  await page.goto("/plus", { waitUntil: "networkidle" });
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

test("subscribe, sign out, then subscribe again with a different account", async ({
  page,
}) => {
  test.setTimeout(80_000);

  await page.goto("/plus", { waitUntil: "networkidle" });
  await button(page, "Monthly").click();
  await textbox(await fillCheckout(page), "Email").fill(generateUserEmail());
  await page.keyboard.press("Enter");
  await signUpWithPassword(page);

  await button(page, "Plus").click();
  await expect(menuitem(page, "Subscription")).toBeVisible();
  await addCurrentUser(page);
  await menuitem(page, "Sign out").click();

  await link(page, "Unlock Ariakit Plus").click();
  await button(page, "Yearly").click();
  await textbox(await fillCheckout(page), "Email").fill(generateUserEmail());
  await page.keyboard.press("Enter");
  await signUpWithPassword(page);

  await button(page, "Plus").click();
  await expect(menuitem(page, "Subscription")).toBeVisible();
});

test("subscribe, clear cookies, then sign up with the same email", async ({
  page,
}) => {
  test.setTimeout(80_000);

  await page.goto("/plus", { waitUntil: "networkidle" });
  await button(page, "Yearly").click();
  const email = generateUserEmail();
  await textbox(await fillCheckout(page), "Email").fill(email);
  await page.keyboard.press("Enter");

  await page.waitForURL(/\/sign-up/);
  await page.context().clearCookies();

  await page.goto("/sign-up", { waitUntil: "networkidle" });
  await textbox(page, "Email address").fill(email);
  await signUpWithPassword(page);

  await button(page, "Plus").click();
  await expect(menuitem(page, "Subscription")).toBeVisible();
});

test("subscribe with email a, sign up with email b, then sign up with email a", async ({
  page,
}) => {
  test.setTimeout(80_000);
  const emailA = generateUserEmail();
  const emailB = generateUserEmail();

  await page.goto("/plus", { waitUntil: "networkidle" });
  await button(page, "Monthly").click();
  await textbox(await fillCheckout(page), "Email").fill(emailA);
  await page.keyboard.press("Enter");
  await textbox(page, "Email address").fill(emailB);
  await signUpWithPassword(page);
  await addCurrentUser(page);

  await button(page, "Plus").click();
  await expect(menuitem(page, "Subscription")).toBeVisible();
  await menuitem(page, "Sign out").click();

  await page.goto("/sign-up", { waitUntil: "networkidle" });
  await textbox(page, "Email address").fill(emailA);
  await signUpWithPassword(page);
  await addCurrentUser(page);

  await button(page, "Plus").click();
  await expect(menuitem(page, "Unlock Ariakit Plus")).toBeVisible();
  await menuitem(page, "Sign out").click();

  await page.goto("/sign-in", { waitUntil: "networkidle" });
  await textbox(page, "Email address").fill(emailB);
  await textbox(page, "Password").fill("password");
  await page.keyboard.press("Enter");

  await page.waitForURL("/");
  await page.goto("/plus");
  await expect(button(page, "Current plan Monthly")).toBeDisabled();
});

// test.skip("subscribe, clear cookies, then sign in with the same email", async ({
//   page,
// }) => {
//   test.setTimeout(80_000);

//   await page.goto("/sign-up", { waitUntil: "networkidle" });
//   const email = generateUserEmail();
//   await textbox(page, "Email address").fill(email);
//   await signUpWithPassword(page);
//   await button(page, "Plus").click();
//   await expect(menuitem(page, "Unlock Ariakit Plus")).toBeVisible();
//   await menuitem(page, "Sign out").click();

//   await link(page, "Unlock Ariakit Plus").click();
//   await button(page, "Yearly").click();
//   await textbox(await fillCheckout(page), "Email").fill(email);
//   await page.keyboard.press("Enter");

//   await page.waitForURL(/\/sign-up/);
//   await page.context().clearCookies();

//   await page.goto("/sign-in", { waitUntil: "networkidle" });
//   await textbox(page, "Email address").fill(email);
//   await textbox(page, "Password").fill("password");
//   await page.keyboard.press("Enter");

//   await page.waitForURL("/");
//   await page.goto("/plus");
//   await expect(button(page, "Current plan Yearly")).toBeDisabled();
// });
