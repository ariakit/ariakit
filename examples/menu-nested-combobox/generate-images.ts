import { query } from "@ariakit/test/playwright";
import { screenshot, test } from "../test-utils.ts";

test("generate images", async ({ page }) => {
  await page.setViewportSize({ width: 800, height: 800 });

  const q = query(page);
  await q.button("Actions").click();
  await q.option("Turn into page in").hover();
  await q.option("Private pages").hover();

  await screenshot({
    page,
    name: "small",
    elements: [q.dialog("Turn into page in")],
    paddingLeft: 24,
    paddingTop: 24,
    width: 150,
    height: 150,
  });

  await screenshot({
    page,
    name: "medium",
    elements: [q.dialog("Turn into page in")],
    padding: 24,
    height: "auto",
  });

  await screenshot({
    page,
    name: "large",
    elements: [q.dialog("Actions"), q.dialog("Turn into page in")],
  });
});
