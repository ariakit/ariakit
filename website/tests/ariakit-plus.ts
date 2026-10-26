import { createClerkClient } from "@clerk/clerk-sdk-node";
import type { FrameLocator, Locator, Page } from "@playwright/test";
import { expect, test } from "@playwright/test";
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
    textbox: (name: string | RegExp, exact = false) =>
      locator.getByRole("textbox", { name, exact }),
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

// Stripe Adaptive Pricing picks the checkout currency from the runner's IP
// address, and a free checkout shows only the local amount, such as MX$0.00.
// Stripe treats customers with a +location_US email as US customers, but only
// when no other subaddress, such as +clerk_test, is present.
// https://docs.stripe.com/payments/currencies/localize-prices/adaptive-pricing
function getStripeCustomerEmail(email: string) {
  return email.replace("+clerk_test@", "+location_US@");
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
  email?: string | null;
  password?: string | null;
  redirectUrl?: string | RegExp | ((url: URL) => boolean);
}

async function fillAuth(page: Page, options: AuthOptions = {}) {
  const q = query(page);
  await page
    .getByLabel("Email address", { exact: true })
    .fill(options.email || generateUserEmail());
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

async function createCustomer(options: AuthOptions = {}) {
  const stripe = getStripeClient();
  const clerk = getClerkClient();

  const email = options.email || generateUserEmail();
  const password = options.password || DEFAULT_PASSWORD;

  const customer = await stripe.customers.create(
    { email: getStripeCustomerEmail(email) },
    { idempotencyKey: email },
  );

  const user = await clerk.users.createUser({
    emailAddress: [email],
    password,
    publicMetadata: { stripeId: customer.id },
  });

  users.add(user.id);

  return customer;
}

// Price and checkout requests list every Stripe coupon, so a leaked coupon
// slows down later tests. The helpers delete their coupon, and a hook deletes
// it when a helper fails or its test times out before that.
// https://github.com/ariakit/ariakit/issues/8097
const freeCoupons = new Set<string>();

async function createFreeCoupon(stripe: Stripe) {
  const coupon = await stripe.coupons.create({
    percent_off: 100,
    duration: "forever",
    max_redemptions: 1,
  });
  freeCoupons.add(coupon.id);
  return coupon;
}

async function deleteFreeCoupon(stripe: Stripe, id: string) {
  await stripe.coupons.del(id);
  freeCoupons.delete(id);
}

async function createCustomerWithOneTimePurchase(
  lookupKey: string,
  options: AuthOptions = {},
) {
  const stripe = getStripeClient();
  const customer = await createCustomer(options);

  const prices = await stripe.prices.list({ lookup_keys: [lookupKey] });
  const price = prices.data[0];
  if (!price) {
    throw new Error(`No price found for lookup key ${lookupKey}`);
  }

  const coupon = await createFreeCoupon(stripe);

  await stripe.invoiceItems.create({
    customer: customer.id,
    price: price.id,
    quantity: 1,
    discounts: [{ coupon: coupon.id }],
  });

  const invoice = await stripe.invoices.create({
    customer: customer.id,
    pending_invoice_items_behavior: "include",
  });
  await stripe.invoices.pay(invoice.id);
  await deleteFreeCoupon(stripe, coupon.id);

  return customer;
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
    { email: getStripeCustomerEmail(email) },
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

  const coupon = await createFreeCoupon(stripe);

  await stripe.subscriptions.create({
    customer: customer.id,
    items: [{ price: price.id, quantity: 1 }],
    coupon: coupon.id,
    backdate_start_date: Math.round(new Date("2023-11-01").getTime() / 1000),
  });

  await deleteFreeCoupon(stripe, coupon.id);

  return customer;
}

async function getDisplayedPrice(page: Page | Locator | FrameLocator) {
  const q = query(page);
  const priceText = (await q
    .text(/^(US)?\$\d+(\.\d*)?$/)
    .first()
    .textContent())!;
  return Math.ceil(Number.parseFloat(priceText.replace(/[^\d.]/g, "")));
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
  const cardNumber = q.textbox("Card number");
  const payButton = q.button(/^Pay$/);
  // Stripe can clear the card number while the checkout is still loading, so
  // fill the form again until Stripe considers it complete.
  await expect(async () => {
    await cardNumber.clear();
    await cardNumber.pressSequentially("4242424242424242", { delay: 50 });
    await q.textbox("Expiration").fill("12/40");
    await q.textbox("CVC").fill("123");
    await q.textbox("Cardholder name").fill("John Doe");
    await q.combobox("Country or region").selectOption("Spain");
    await expect(payButton).toHaveClass(/SubmitButton--complete/);
  }).toPass({ timeout: 30_000 });
  await payButton.hover();
  await expect(async () => {
    const boundingBox = await payButton.boundingBox();
    await page.waitForTimeout(100);
    expect(await payButton.boundingBox()).toEqual(boundingBox);
  }).toPass({ timeout: 5000 });
  return frame;
}

test.skip(() => !process.env.CLERK_SECRET_KEY);

test.afterEach(async () => {
  if (!freeCoupons.size) return;
  const stripe = getStripeClient();
  const ids = Array.from(freeCoupons);
  freeCoupons.clear();
  await Promise.all(ids.map((id) => stripe.coupons.del(id)));
});

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
  test(`${plan}ly subscriber still has access to Plus`, async ({ page }) => {
    test.setTimeout(60_000);

    const q = query(page);
    await page.goto("/sign-in", { waitUntil: "networkidle" });

    const email = generateUserEmail();
    await createCustomerWithSubscription(plan, { email });
    await fillSignIn(page, { email, redirectUrl: "/" });

    await q.button("Plus").click();
    await expect(q.menuitem("Benefits")).toBeVisible();
    await expect(q.menuitem("Billing")).toBeVisible();
  });

  test(`${plan}ly subscriber purchasing Plus`, async ({ page }) => {
    test.setTimeout(60_000);

    const q = query(page);
    await page.goto("/components", { waitUntil: "networkidle" });

    await q.link("Unlock Ariakit Plus").click();
    await page.waitForURL("/plus");
    const price = await getDisplayedPrice(page);

    await q.link("Buy now").click();
    await q.textbox("Email address", true).click();
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

    await fillCheckout(page, getStripeCustomerEmail(email));
    await fq.button(/^Pay$/).click();
    await expect(q.text("Purchased")).toBeVisible({ timeout: 10000 });

    const stripe = getStripeClient();
    // Wait for stripe
    await page.waitForTimeout(1000);
    await expect(async () => {
      const subs = await stripe.subscriptions.list({ customer: customer.id });
      expect(subs.data.length).toBe(0);
    }).toPass({ intervals: [2000, 5000, 10000] });

    await expect(async () => {
      await q.button("Back to page").click();
      await page.waitForURL("/components", { timeout: 2000 });
    }).toPass({ intervals: [2000, 5000, 10000] });

    await q.button("Plus").click();
    await expect(q.menuitem("Billing")).toBeVisible();
  });
}

test("old one-time purchaser still has access to Plus", async ({ page }) => {
  test.setTimeout(60_000);

  const q = query(page);
  await page.goto("/sign-in", { waitUntil: "networkidle" });

  const email = generateUserEmail();
  await createCustomerWithOneTimePurchase("ariakit-plus-one-time-240", {
    email,
  });
  await fillSignIn(page, { email, redirectUrl: "/" });

  await q.button("Plus").click();
  await q.menuitem("Benefits").click();
  await expect(q.text("Purchased")).toBeVisible();
});

test("purchase Plus from /plus, sign out, sign in again, and access the billing page", async ({
  page,
}) => {
  test.setTimeout(80_000);

  const q = query(page);
  await page.goto("/plus");

  await q.link("Buy now").click();
  const email = generateUserEmail();
  await fillSignUp(page, { email, redirectUrl: /\/plus/ });

  const frame = await fillCheckout(page, email);
  const fq = query(frame);

  await fq.button(/^Pay$/).click();
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
  await page.waitForURL(/\/sign-in/);
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

test("purchase Plus from /components, sign out, sign in again, and access the billing page", async ({
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

  await fq.button(/^Pay$/).click();
  await expect(q.text("Purchased")).toBeVisible({ timeout: 10000 });

  await expect(async () => {
    await q.button("Back to page").click();
    await page.waitForURL("/components", { timeout: 2000 });
  }).toPass({ intervals: [2000, 5000, 10000] });

  await q.button("Plus").click();
  await q.menuitem("Benefits").click();
  await page.waitForURL("/plus");
  await expect(q.text("Purchased")).toBeVisible();

  await page.keyboard.press("Escape");
  await q.button("Plus").click();
  await q.menuitem("Sign out").click();

  await q.link("Unlock Ariakit Plus").click();
  await q.link("Sign in").click();
  await page.waitForURL(/\/sign-in/);
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

test.describe("with coupon", () => {
  let coupon: Stripe.Coupon | null = null;

  test.beforeEach(async () => {
    const stripe = getStripeClient();
    coupon = await stripe.coupons.create({
      percent_off: 100,
      duration: "forever",
      // The afterEach hook deletes the coupon. The expiration only cleans up
      // after an interrupted run, so it must outlast the test timeout.
      redeem_by: Math.round(Date.now() / 1000) + 5 * 60,
      metadata: { type: "sale", scope: process.env.STRIPE_SALE_SCOPE ?? null },
    });
  });

  test.afterEach(async () => {
    if (!coupon) return;
    const stripe = getStripeClient();
    await stripe.coupons.del(coupon.id);
  });

  test("ensure sale discount is applied", async ({ page }) => {
    test.setTimeout(60_000);

    const q = query(page);
    const stripe = getStripeClient();
    const email = generateUserEmail();
    await createCustomer({ email });

    await stripe.promotionCodes.create({
      coupon: coupon!.id,
      max_redemptions: 1,
    });

    // Check price with unauthenticated user
    await expect(async () => {
      await page.goto("/plus");
      expect(await getDisplayedPrice(page)).toBe(0);
    }).toPass({ intervals: [2000, 5000, 10000] });

    // Check price with authenticated user
    await page.goto("/sign-in", { waitUntil: "networkidle" });
    await fillSignIn(page, { email });
    await page.goto("/plus");
    const price = await getDisplayedPrice(page);
    expect(price).toBe(0);

    await q.link("Buy now").click();
    const frame = frameLocator(page);
    const checkoutPrice = await getDisplayedPrice(frame);
    expect(checkoutPrice).toBe(price);
  });

  test("ensure customer discount is applied only to customer", async ({
    page,
  }) => {
    test.setTimeout(60_000);

    const q = query(page);
    const stripe = getStripeClient();

    const emailWithoutDiscount = generateUserEmail();
    const emailWithDiscount = generateUserEmail();
    await createCustomer({ email: emailWithoutDiscount });
    const customerWithDiscount = await createCustomer({
      email: emailWithDiscount,
    });

    await stripe.promotionCodes.create({
      coupon: coupon!.id,
      customer: customerWithDiscount.id,
      max_redemptions: 1,
    });

    // Check price with unauthenticated user
    await page.goto("/plus");
    expect(await getDisplayedPrice(page)).toBeGreaterThan(0);

    // Check price with authenticated user without discount
    await page.goto("/sign-in", { waitUntil: "networkidle" });
    await fillSignIn(page, { email: emailWithoutDiscount });
    await page.goto("/plus");
    const price = await getDisplayedPrice(page);
    expect(price).toBeGreaterThan(0);

    await q.link("Buy now").click();
    const frame = frameLocator(page);
    const checkoutPrice = await getDisplayedPrice(frame);
    expect(checkoutPrice).toBe(price);

    // Sign out
    await q.button("Plus").click();
    await q.menuitem("Sign out").click();

    // Check price with authenticated user with discount
    await page.goto("/sign-in", { waitUntil: "networkidle" });
    await fillSignIn(page, { email: emailWithDiscount });
    await page.goto("/plus");
    const nextPrice = await getDisplayedPrice(page);
    expect(nextPrice).toBe(0);

    await q.link("Buy now").click();
    const nextFrame = frameLocator(page);
    const nextCheckoutPrice = await getDisplayedPrice(nextFrame);
    expect(nextCheckoutPrice).toBe(0);
  });
});
