import { query } from "@ariakit/test/playwright";
import { screenshot, test } from "../test-utils.ts";

test("generate images", async ({ page }) => {
  await page.setViewportSize({ width: 641, height: 480 });

  const q = query(page);
  await q.button("Show modal").click();
  await q.button("Say Hello").last().click();
  const toastify = page.locator(".Toastify__toast-container");

  await toastify.evaluate((el) => (el.style.maxWidth = "150px"));
  await q.alert().first().hover();

  await screenshot({
    page,
    name: "small",
    elements: [toastify],
    padding: 24,
    height: "auto",
  });

  await screenshot({
    page,
    name: "medium",
    elements: [toastify],
    padding: 16,
    paddingLeft: 72,
    height: "auto",
  });

  await screenshot({
    page,
    name: "large",
    elements: [toastify, q.dialog()],
  });
});
