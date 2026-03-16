import { query } from "@ariakit/test/playwright";
import { screenshot, test } from "../test-utils.ts";

test("generate images", async ({ page }) => {
  const q = query(page);
  await q.button().click();
  await q.button("Remove").first().click();

  await screenshot({
    page,
    name: "small",
    elements: [q.dialog("Remove")],
    paddingTop: -64,
    paddingLeft: 24,
    width: 163,
    height: "auto",
  });

  await screenshot({
    page,
    name: "medium",
    elements: [q.dialog("Remove")],
    padding: 24,
    paddingY: 40,
    height: "auto",
  });

  await screenshot({
    page,
    name: "large",
    elements: [q.dialog("Shopping Cart"), q.dialog("Remove")],
  });
});
