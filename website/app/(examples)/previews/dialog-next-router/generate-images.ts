import { query } from "@ariakit/test/playwright";
import { screenshot, test } from "examples/test-utils.ts";

test("generate images", async ({ page }) => {
  const q = query(page);
  await q.link().click();

  await screenshot({
    page,
    name: "small",
    elements: [q.dialog()],
    padding: 24,
    width: 180,
    height: "auto",
  });

  await screenshot({
    page,
    name: "large",
    elements: [q.dialog()],
  });

  await q.dialog().evaluate((el) => {
    el.style.borderBottomLeftRadius = "0";
    el.style.borderBottomRightRadius = "0";
  });

  await screenshot({
    page,
    name: "medium",
    elements: [q.dialog()],
    padding: 24,
    paddingTop: 44,
    height: "auto",
  });
});
