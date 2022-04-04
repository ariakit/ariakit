import { navigateToExamplePage } from "ariakit-test-utils/e2e";

navigateToExamplePage(__dirname);

test("edit playground", async () => {
  await expect(page.title()).resolves.toMatch("");
  await page.click(
    "[role=group][aria-label='index.js'] [contenteditable=true]"
  );
  await page.keyboard.press("ArrowUp");
  await page.keyboard.press("ArrowUp");
  await page.keyboard.down("Alt");
  await page.keyboard.press("ArrowRight");
  await page.keyboard.press("ArrowRight");
  await page.keyboard.press("ArrowRight");
  await page.keyboard.press("ArrowRight");
  await page.keyboard.down("Shift");
  await page.keyboard.press("ArrowRight");
  await page.keyboard.up("Alt");
  await page.keyboard.up("Shift");
  await page.keyboard.type("Hey");

  await expect(page).toMatchElement(".playground .preview div", {
    text: "Hey World",
    timeout: 7000,
  });
}, 10000);
