import { expect, test } from "@playwright/test";
import type { Page } from "@playwright/test";

function getButton(locator: Pick<Page, "getByRole">, name: string | RegExp) {
  return locator.getByRole("button", { name });
}

function getTextbox(locator: Pick<Page, "getByRole">, name: string | RegExp) {
  return locator.getByRole("textbox", { name });
}

test("visit /plus and subscribe to monthly plan without login", async ({
  page,
}) => {
  await page.goto("/plus", { waitUntil: "networkidle" });

  await getButton(page, "Monthly").click();

  const frame = page.frameLocator("[name=embedded-checkout]");

  await getTextbox(frame, "Email").fill("test+clerk_test@example.com");
  await getTextbox(frame, "Card number").fill("4242424242424242");
  await getTextbox(frame, "Expiration").fill("12/40");
  await getTextbox(frame, "CVC").fill("123");
  await getTextbox(frame, "Cardholder name").fill("Test User");

  await page.keyboard.press("Enter");

  await page.waitForURL(/\/sign-up\?session\-id/, { waitUntil: "networkidle" });
});
