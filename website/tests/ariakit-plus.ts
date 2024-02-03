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

const users = new Set<string>();

async function addCurrentUser(page: Page) {
  const user = await getCurrentUser(page);
  if (!user) return;
  users.add(user.id);
  return user;
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
  return addCurrentUser(page);
}

async function fillSignUp(page: Page, options: AuthOptions = {}) {
  const q = query(page);
  await fillAuth(page, options);
  await q.textbox("Verification code").click();
  await page.keyboard.type("424242424242424242424242", { delay: 250 });
  await page.waitForURL(options.redirectUrl || "/");
  return addCurrentUser(page);
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

for (const plan of ["month", "year"] as const) {
  test(`${plan}ly subscriber purchasing Plus`, async ({ page }) => {
    test.setTimeout(60_000);

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

test("puschase Plus from /plus, sign out, sign in again, and access the billing page", async ({
  page,
}) => {
  test.setTimeout(80_000);

  const q = query(page);
  await page.goto("/plus", { waitUntil: "networkidle" });

  await q.link("Buy now").click();
  const email = generateUserEmail();
  await fillSignUp(page, { email, redirectUrl: /\/plus/ });

  const frame = await fillCheckout(page, email);
  const fq = query(frame);

  await fq.button("Pay").click();
  await expect(q.text("Purchased")).toBeVisible({ timeout: 10000 });

  await page.goto("/", { waitUntil: "networkidle" });

  await q.button("Plus").click();
  await q.menuitem("Benefits").click();
  await page.waitForURL("/plus");
  await expect(q.text("Purchased")).toBeVisible();

  await page.keyboard.press("Escape");
  await page.waitForURL("/");
  await q.button("Plus").click();
  await q.menuitem("Sign out").click();

  await q.link("Unlock Ariakit Plus").click();
  await q.link("Sign in").click();
  await page.waitForURL(/\/sign\-in/);
  await fillSignIn(page, { email, redirectUrl: "/" });

  await q.button("Plus").click();
  const pagePromise = page.context().waitForEvent("page");
  await q.menuitem("Billing").click();
  const newPage = await pagePromise;
  const nq = query(newPage);

  await expect(nq.text(email)).toBeVisible();
  await expect(nq.text("Paid")).toBeVisible();
  await expect(nq.text("Ariakit Plus")).toBeVisible();
});

test("puschase Plus from /components, sign out, sign in again, and access the billing page", async ({
  page,
}) => {
  test.setTimeout(80_000);

  const q = query(page);
  await page.goto("/components", { waitUntil: "networkidle" });

  await q.link("Unlock Ariakit Plus").click();
  await page.waitForURL("/plus");

  await q.link("Buy now").click();
  const email = generateUserEmail();
  await fillSignUp(page, { email, redirectUrl: /\/plus/ });

  const frame = await fillCheckout(page, email);
  const fq = query(frame);

  await fq.button("Pay").click();
  await expect(q.text("Purchased")).toBeVisible({ timeout: 10000 });

  await q.button("Back to page").click();
  await page.waitForURL("/components");

  await q.button("Plus").click();
  await q.menuitem("Benefits").click();
  await page.waitForURL("/plus");
  await expect(q.text("Purchased")).toBeVisible();

  await page.keyboard.press("Escape");
  await q.button("Plus").click();
  await q.menuitem("Sign out").click();

  await q.link("Unlock Ariakit Plus").click();
  await q.link("Sign in").click();
  await page.waitForURL(/\/sign\-in/);
  await fillSignIn(page, { email, redirectUrl: "/components" });

  await q.button("Plus").click();
  const pagePromise = page.context().waitForEvent("page");
  await q.menuitem("Billing").click();
  const newPage = await pagePromise;
  const nq = query(newPage);

  await expect(nq.text(email)).toBeVisible();
  await expect(nq.text("Paid")).toBeVisible();
  await expect(nq.text("Ariakit Plus")).toBeVisible();
});
