import { navigateToExamplePage } from "ariakit-test-utils/e2e";

navigateToExamplePage(__dirname);

test("edit playground", async () => {
  await expect(page.title()).resolves.toMatch("");
  await page.click(
    "[role=group][aria-label='index.js'] [contenteditable=true]",
    { delay: 100 }
  );
  await page.keyboard.press("ArrowUp", { delay: 100 });
  await page.keyboard.press("ArrowUp", { delay: 100 });
  await page.keyboard.down("Alt");
  await page.keyboard.press("ArrowRight", { delay: 100 });
  await page.keyboard.press("ArrowRight", { delay: 100 });
  await page.keyboard.press("ArrowRight", { delay: 100 });
  await page.keyboard.press("ArrowRight", { delay: 100 });
  await page.keyboard.down("Shift");
  await page.keyboard.press("ArrowRight", { delay: 100 });
  await page.keyboard.up("Alt");
  await page.keyboard.up("Shift");
  await page.keyboard.type("Hey", { delay: 100 });

  await expect(page).toMatchElement(".playground .preview div", {
    text: "Hey World",
    timeout: 7000,
  });
}, 10000);
