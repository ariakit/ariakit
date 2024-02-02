import { createClerkClient } from "@clerk/clerk-sdk-node";
import { expect, test } from "@playwright/test";
import type { FrameLocator, Locator, Page } from "@playwright/test";
import dotenv from "dotenv";
import { Stripe } from "stripe";

const DEFAULT_PASSWORD = "password";

dotenv.config({ path: new URL("../.env.local", import.meta.url) });

function query(locator: Pick<Page, "getByRole" | "getByText">) {
  return {
    text: (name: string | RegExp) => locator.getByText(name),
    combobox: (name: string | RegExp) =>
      locator.getByRole("combobox", { name }),
    button: (name: string | RegExp) => locator.getByRole("button", { name }),
    link: (name: string | RegExp) => locator.getByRole("link", { name }),
    textbox: (name: string | RegExp) => locator.getByRole("textbox", { name }),
    menuitem: (name: string | RegExp) =>
      locator.getByRole("menuitem", { name }),
  };
}

function getClerkClient() {
  return createClerkClient({ secretKey: process.env.CLERK_SECRET_KEY });
}

function getStripeClient() {
  return new Stripe(process.env.STRIPE_SECRET_KEY!);
}

function generateUserEmail() {
  return `${Math.random().toString(36).slice(2)}+clerk_test@example.com`;
}

function getCurrentUser(page: Page) {
  return page.evaluate(() => window.Clerk?.user || null);
}

interface AuthOptions {
  email?: string;
  password?: string;
  redirectUrl?: string | RegExp | ((url: URL) => boolean);
}

async function fillAuth(page: Page, options: AuthOptions = {}) {
  const q = query(page);
  await q.textbox("Email address").fill(options.email || generateUserEmail());
  await q.textbox("Password").fill(options.password || DEFAULT_PASSWORD);
  await page.keyboard.press("Enter");
}

async function fillSignIn(page: Page, options: AuthOptions = {}) {
  await fillAuth(page, options);
  await page.waitForURL(options.redirectUrl || "/");
  return getCurrentUser(page);
}

async function fillSignUp(page: Page, options: AuthOptions = {}) {
  const q = query(page);
  await fillAuth(page, options);
  await q.textbox("Verification code").click();
  await page.keyboard.type("424242424242424242424242", { delay: 250 });
  await page.waitForURL(options.redirectUrl || "/");
  return getCurrentUser(page);
}

async function createCustomerWithSubscription(
  interval: "month" | "year",
  options: AuthOptions = {},
) {
  const stripe = getStripeClient();
  const clerk = getClerkClient();

  const email = options.email || generateUserEmail();
  const password = options.password || DEFAULT_PASSWORD;

  const customer = await stripe.customers.create(
    { email },
    { idempotencyKey: email },
  );

  await clerk.users.createUser({
    emailAddress: [email],
    password,
    publicMetadata: { stripeId: customer.id },
  });

  let price: Stripe.Price | null = null;

  for await (price of stripe.prices.list({
    limit: 100,
    active: true,
    type: "recurring",
  })) {
    if (price.recurring?.interval === interval) break;
    price = null;
  }

  if (!price) {
    throw new Error(`No ${interval}ly recurring price found`);
  }

  const coupon = await stripe.coupons.create({
    percent_off: 100,
    duration: "forever",
    max_redemptions: 1,
  });

  await stripe.subscriptions.create({
    customer: customer.id,
    items: [{ price: price.id, quantity: 1 }],
    coupon: coupon.id,
    backdate_start_date: Math.round(new Date("2023-11-01").getTime() / 1000),
  });

  await stripe.coupons.del(coupon.id);

  return customer;
}

async function getDisplayedPrice(page: Page | Locator | FrameLocator) {
  const q = query(page);
  const priceText = (await q
    .text(/^(US)?\$\d+(\.\d*)?$/)
    .first()
    .textContent())!;
  return Math.ceil(parseFloat(priceText.replace(/[^\d\.]/g, "")));
}

function frameLocator(page: Page) {
  const frame = page.frameLocator("[name=embedded-checkout]");
  return frame;
}

async function fillCheckout(page: Page, assertEmail?: string) {
  const frame = frameLocator(page);
  const q = query(frame);
  if (assertEmail) {
    await expect(frame.getByText(assertEmail)).toBeVisible();
  }
  await q.textbox("Card number").fill("4242424242424242");
  await q.textbox("Expiration").fill("12/40");
  await q.textbox("CVC").fill("123");
  await q.textbox("Cardholder name").fill("John Doe");
  await q.combobox("Country").selectOption("Spain");
  return frame;
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
  const clerk = getClerkClient();
  await Promise.all(
    Array.from(users).map((user) => clerk.users.deleteUser(user)),
  );
});

test.describe.configure({ retries: 0 });

for (const plan of ["month", "year"] as const) {
  test(`${plan}ly subscriber purchasing Plus`, async ({ page }) => {
    test.setTimeout(80_000);
    const q = query(page);
    await page.goto("/components", { waitUntil: "networkidle" });

    await q.link("Unlock Ariakit Plus").click();
    await page.waitForURL("/plus");
    const price = await getDisplayedPrice(page);

    await q.link("Buy now").click();
    await q.textbox("Email address").click();
    await q.link("Sign in").first().click();

    const email = generateUserEmail();
    const customer = await createCustomerWithSubscription(plan, { email });
    await fillSignIn(page, { email, redirectUrl: /\/plus/ });

    const nextPrice = await getDisplayedPrice(page);
    expect(nextPrice).toBeLessThan(price);

    const frame = frameLocator(page);
    const fq = query(frame);
    const checkoutPrice = await getDisplayedPrice(frame);
    expect(checkoutPrice).toBe(nextPrice);

    await fillCheckout(page, email);
    await fq.button("Pay").click();

    await expect(q.text("Purchased")).toBeVisible({ timeout: 10000 });

    const stripe = getStripeClient();
    const subs = await stripe.subscriptions.list({ customer: customer.id });
    expect(subs.data.length).toBe(0);

    await q.button("Back to page").click();
    await page.waitForURL("/components");

    await q.button("Plus").click();
    await expect(q.menuitem("Billing")).toBeVisible();
  });
}

// test("puschase Plus from /plus", async ({ page }) => {});

// test("puschase Plus from /components/button", async ({ page }) => {});

// test("sign up, sign out, then purchase Plus with the same account", async ({
//   page,
// }) => {});

// Remove below here

// for (const plan of ["Monthly", "Yearly"]) {
//   test(`subscribe to ${plan} plan without login, then switch plans`, async ({
//     page,
//     context,
//   }) => {
//     test.setTimeout(100_000);

//     await page.goto("/plus", { waitUntil: "networkidle" });
//     await button(page, plan).click();
//     const email = generateUserEmail();
//     const frame = await fillCheckout(page);
//     await textbox(frame, "Email").fill(email);
//     await page.keyboard.press("Enter");

//     await page.waitForURL(/\/sign-up\?session\-id/);
//     await expect(textbox(page, "Email address")).toHaveValue(email);
//     await signUpWithPassword(page);
//     await button(page, "Plus").click();
//     await expect(menuitem(page, "Subscription")).toBeVisible();

//     const alternatePlan = plan === "Monthly" ? "Yearly" : "Monthly";
//     await updatePlanOnSite(page, context, plan, alternatePlan);

//     await page.goto("/components/button");
//     const pagePromise = context.waitForEvent("page");
//     await button(page, "Vite").click();
//     await pagePromise;
//   });
// }

// test("sign up, then subscribe to Monthly plan", async ({ page }) => {
//   test.setTimeout(80_000);

//   await page.goto("/sign-up", { waitUntil: "networkidle" });
//   const email = generateUserEmail();
//   await textbox(page, "Email address").fill(email);
//   await signUpWithPassword(page);
//   await button(page, "Plus").click();
//   await expect(menuitem(page, "Unlock Ariakit Plus")).toBeVisible();

//   await page.goto("/components/button", { waitUntil: "networkidle" });
//   await link(page, "Vite").click();

//   await page.waitForURL("/plus?feature=edit-examples");
//   await button(page, "Monthly").click();
//   await fillCheckout(page, email);
//   await page.keyboard.press("Enter");

//   await page.waitForURL(/\/\?session\-id/);
//   const sessionId = new URL(page.url()).searchParams.get("session-id");

//   await button(page, "Plus").click();
//   await expect(menuitem(page, "Subscription")).toBeVisible();
//   await addCurrentUser(page);
//   await menuitem(page, "Sign out").click();

//   await page.goto(`/sign-up?session-id=${sessionId}`);
//   await expect(textbox(page, "Email address")).toHaveValue(email);
//   await textbox(page, "Email address").fill(generateUserEmail());
//   await signUpWithPassword(page);
//   await button(page, "Plus").click();
//   await expect(menuitem(page, "Unlock Ariakit Plus")).toBeVisible();
// });

// test("subscribe, then sign in with free account", async ({ page }) => {
//   test.setTimeout(80_000);

//   await page.goto("/sign-up", { waitUntil: "networkidle" });
//   const email = generateUserEmail();
//   await textbox(page, "Email address").fill(email);
//   await signUpWithPassword(page);

//   await button(page, "Plus").click();
//   await expect(menuitem(page, "Unlock Ariakit Plus")).toBeVisible();
//   await menuitem(page, "Sign out").click();

//   await page.goto("/plus", { waitUntil: "networkidle" });
//   await button(page, "Monthly").click();
//   await textbox(await fillCheckout(page), "Email").fill(email);
//   await page.keyboard.press("Enter");

//   await page.waitForURL(/\/sign-up/);
//   await link(page, "Sign in").click();

//   await page.waitForURL(/\/sign-in/);
//   await textbox(page, "Email address").fill(email);
//   await textbox(page, "Password").fill("password");
//   await page.keyboard.press("Enter");

//   await page.waitForURL("/");
//   await page.goto("/plus");
//   await expect(button(page, "Current plan Monthly")).toBeDisabled();
// });

// test("subscribe, then sign in with paid account", async ({ page }) => {
//   test.setTimeout(80_000);

//   await page.goto("/plus", { waitUntil: "networkidle" });
//   await button(page, "Monthly").click();
//   const email = generateUserEmail();
//   await textbox(await fillCheckout(page), "Email").fill(email);
//   await page.keyboard.press("Enter");
//   await signUpWithPassword(page);

//   await button(page, "Plus").click();
//   await expect(menuitem(page, "Subscription")).toBeVisible();
//   await menuitem(page, "Sign out").click();

//   await page.goto("/plus", { waitUntil: "networkidle" });
//   await button(page, "Yearly").click();
//   await textbox(await fillCheckout(page), "Email").fill(email);
//   await page.keyboard.press("Enter");

//   await page.waitForURL(/\/sign-up/);
//   await link(page, "Sign in").click();

//   await page.waitForURL(/\/sign-in/);
//   await textbox(page, "Email address").fill(email);
//   await textbox(page, "Password").fill("password");
//   await page.keyboard.press("Enter");

//   await page.waitForURL("/");
//   await page.goto("/plus");
//   await expect(button(page, "Current plan Monthly")).toBeDisabled();
// });

// test("subscribe, sign out, then subscribe again with a different account", async ({
//   page,
// }) => {
//   test.setTimeout(80_000);

//   await page.goto("/plus", { waitUntil: "networkidle" });
//   await button(page, "Monthly").click();
//   await textbox(await fillCheckout(page), "Email").fill(generateUserEmail());
//   await page.keyboard.press("Enter");
//   await signUpWithPassword(page);

//   await button(page, "Plus").click();
//   await expect(menuitem(page, "Subscription")).toBeVisible();
//   await addCurrentUser(page);
//   await menuitem(page, "Sign out").click();

//   await link(page, "Unlock Ariakit Plus").click();
//   await button(page, "Yearly").click();
//   await textbox(await fillCheckout(page), "Email").fill(generateUserEmail());
//   await page.keyboard.press("Enter");
//   await signUpWithPassword(page);

//   await button(page, "Plus").click();
//   await expect(menuitem(page, "Subscription")).toBeVisible();
// });

// test("subscribe, clear cookies, then sign up with the same email", async ({
//   page,
// }) => {
//   test.setTimeout(80_000);

//   await page.goto("/plus", { waitUntil: "networkidle" });
//   await button(page, "Yearly").click();
//   const email = generateUserEmail();
//   await textbox(await fillCheckout(page), "Email").fill(email);
//   await page.keyboard.press("Enter");

//   await page.waitForURL(/\/sign-up/);
//   await page.context().clearCookies();

//   await page.goto("/sign-up", { waitUntil: "networkidle" });
//   await textbox(page, "Email address").fill(email);
//   await signUpWithPassword(page);

//   await button(page, "Plus").click();
//   await expect(menuitem(page, "Subscription")).toBeVisible();
// });

// test("subscribe with email a, sign up with email b, then sign up with email a", async ({
//   page,
// }) => {
//   test.setTimeout(80_000);
//   const emailA = generateUserEmail();
//   const emailB = generateUserEmail();

//   await page.goto("/plus", { waitUntil: "networkidle" });
//   await button(page, "Monthly").click();
//   await textbox(await fillCheckout(page), "Email").fill(emailA);
//   await page.keyboard.press("Enter");
//   await textbox(page, "Email address").fill(emailB);
//   await signUpWithPassword(page);
//   await addCurrentUser(page);

//   await button(page, "Plus").click();
//   await expect(menuitem(page, "Subscription")).toBeVisible();
//   await menuitem(page, "Sign out").click();

//   await page.goto("/sign-up", { waitUntil: "networkidle" });
//   await textbox(page, "Email address").fill(emailA);
//   await signUpWithPassword(page);
//   await addCurrentUser(page);

//   await button(page, "Plus").click();
//   await expect(menuitem(page, "Unlock Ariakit Plus")).toBeVisible();
//   await menuitem(page, "Sign out").click();

//   await page.goto("/sign-in", { waitUntil: "networkidle" });
//   await textbox(page, "Email address").fill(emailB);
//   await textbox(page, "Password").fill("password");
//   await page.keyboard.press("Enter");

//   await page.waitForURL("/");
//   await page.goto("/plus");
//   await expect(button(page, "Current plan Monthly")).toBeDisabled();
// });

// // test.skip("subscribe, clear cookies, then sign in with the same email", async ({
// //   page,
// // }) => {
// //   test.setTimeout(80_000);

// //   await page.goto("/sign-up", { waitUntil: "networkidle" });
// //   const email = generateUserEmail();
// //   await textbox(page, "Email address").fill(email);
// //   await signUpWithPassword(page);
// //   await button(page, "Plus").click();
// //   await expect(menuitem(page, "Unlock Ariakit Plus")).toBeVisible();
// //   await menuitem(page, "Sign out").click();

// //   await link(page, "Unlock Ariakit Plus").click();
// //   await button(page, "Yearly").click();
// //   await textbox(await fillCheckout(page), "Email").fill(email);
// //   await page.keyboard.press("Enter");

// //   await page.waitForURL(/\/sign-up/);
// //   await page.context().clearCookies();

// //   await page.goto("/sign-in", { waitUntil: "networkidle" });
// //   await textbox(page, "Email address").fill(email);
// //   await textbox(page, "Password").fill("password");
// //   await page.keyboard.press("Enter");

// //   await page.waitForURL("/");
// //   await page.goto("/plus");
// //   await expect(button(page, "Current plan Yearly")).toBeDisabled();
// // });
