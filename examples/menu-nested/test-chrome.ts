import { expect, query } from "@ariakit/test/playwright";
import { test } from "../test-utils.ts";

test("https://github.com/ariakit/ariakit/issues/4247", async ({ page }) => {
  const q = query(page);
  await q.button("Edit").click();
  await expect(q.menu("Edit")).toBeVisible();
  await q.menuitem("Find").hover();
  await expect(q.menu("Find")).toBeVisible();
  const { x, y } = (await q.menuitem("Speech").boundingBox())!;
  await page.mouse.move(x + 10, y + 10, { steps: 2 });
  await expect(q.menu("Speech")).toBeVisible();
  await expect(q.menu("Find")).not.toBeVisible();
});
