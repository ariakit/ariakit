import { query } from "@ariakit/test/playwright";
import { screenshot, test } from "../test-utils.ts";

test("generate images", async ({ page }) => {
  const q = query(page);
  await q.button().click();
  await q.textbox().fill("Hello");
  await page.keyboard.press("Escape");
  await q.dialog("Save post?").click();

  await screenshot({
    page,
    name: "small",
    elements: [q.dialog("Save post?")],
    paddingTop: 36,
    paddingLeft: 24,
    width: 160,
    height: "auto",
  });

  await screenshot({
    page,
    name: "medium",
    elements: [q.dialog("Save post?")],
    paddingTop: 96,
    padding: 40,
    height: "auto",
  });

  await screenshot({
    page,
    name: "large",
    elements: [q.dialog("Post", { exact: true }), q.dialog("Save post?")],
  });
});
