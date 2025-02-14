import { screenshot, test } from "../test-utils.ts";

test("generate images", async ({ page }) => {
  const label = page.locator("label");

  await screenshot({
    page,
    name: "small",
    elements: [label],
    padding: 24,
    width: 136,
  });

  await screenshot({
    page,
    name: "medium",
    elements: [label],
    padding: 40,
  });

  await screenshot({
    page,
    name: "large",
    elements: [label],
  });
});
