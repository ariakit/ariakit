import { navigateToExamplePage } from "ariakit-test-utils/e2e";

navigateToExamplePage(__dirname);

test("edit playground", async () => {
  await expect(page.title()).resolves.toMatch("");
  await page.click(
    "[role=group][aria-label='index.js'] [contenteditable=true]",
    { delay: 100 }
  );

  await expect(page).toMatchElement(".playground .preview div", {
    text: "Hello World",
  });

  await page.keyboard.press("ArrowUp");
  await page.keyboard.press("ArrowUp");
  for await (const _ of Array(14)) {
    await page.keyboard.press("ArrowRight");
  }
  await page.keyboard.down("Shift");
  for await (const _ of Array(5)) {
    await page.keyboard.press("ArrowRight");
  }
  await page.keyboard.type("Hey");

  await expect(page).toMatchElement(".playground .preview div", {
    text: "Hey World",
    timeout: 1000,
  });
});
