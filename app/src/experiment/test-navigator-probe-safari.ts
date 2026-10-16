import { test } from "@playwright/test";

const ids = ["button", "link", "checkbox", "radio", "range", "submit", "text"];

// Temporary experiment probe. It records the values that Ariakit platform
// helpers in packages/ariakit-utils/src/platform.ts read, and whether a click
// focuses native controls, in the current WebKit build.
test("navigator probe", async ({ page }, testInfo) => {
  await page.setContent(`
    <button id="button">Button</button>
    <a id="link" href="#x">Link</a>
    <input id="checkbox" type="checkbox" aria-label="Checkbox" />
    <input id="radio" type="radio" aria-label="Radio" />
    <input id="range" type="range" aria-label="Range" />
    <input id="submit" type="submit" />
    <input id="text" aria-label="Text" />
  `);
  const clickFocus: Record<string, string> = {};
  for (const id of ids) {
    await page.locator(`#${id}`).click();
    clickFocus[id] = await page.evaluate(
      () => document.activeElement?.id || "body",
    );
    await page.evaluate(() => {
      const element = document.activeElement;
      if (element instanceof HTMLElement) {
        element.blur();
      }
    });
  }
  const values = await page.evaluate(() => {
    const isApple = /mac|iphone|ipad|ipod/i.test(navigator.platform);
    return {
      platform: navigator.platform,
      vendor: navigator.vendor,
      userAgent: navigator.userAgent,
      maxTouchPoints: navigator.maxTouchPoints,
      isApple,
      isSafari: isApple && /apple/i.test(navigator.vendor),
      isMac: navigator.platform.startsWith("Mac") && !navigator.maxTouchPoints,
    };
  });
  const result = { ...values, clickFocus };
  console.log(`NAVIGATOR_PROBE ${JSON.stringify(result)}`);
  await testInfo.attach("navigator-probe", {
    body: JSON.stringify(result, null, 2),
    contentType: "application/json",
  });
});
