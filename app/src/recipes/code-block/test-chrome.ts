import type { Locator } from "@playwright/test";
import { withFramework } from "#app/test-utils/preview.ts";

const source = `import { useState } from "react";

export function Counter() {
  const [count, setCount] = useState(0);
  return (
    <button type="button" onClick={() => setCount(count + 1)}>
      Clicked {count} times
    </button>
  );
}`;

function getColor(locator: Locator) {
  return locator.evaluate((element) => getComputedStyle(element).color);
}

withFramework(import.meta.dirname, async ({ test, query }) => {
  test("copies the code", async ({ context, page, q }) => {
    await context.grantPermissions(["clipboard-read", "clipboard-write"]);
    await q.button("Copy code").click();
    await test.expect(q.button("Copied")).toBeVisible();
    const copied = await page.evaluate(() => navigator.clipboard.readText());
    test.expect(copied).toBe(source);
  });

  test("names the scroll area with its label", async ({ q }) => {
    const code = q.region("Counter component");
    await test.expect(code).toBeVisible();
    await test.expect(code).toHaveAttribute("tabindex", "0");
    await test.expect(code).toHaveText(source);
  });

  test("adapts token colors when the layer changes", async ({ page, q }) => {
    const keyword = query(q.region("Counter component")).text("export");
    await page.emulateMedia({ colorScheme: "dark" });
    const darkColor = await getColor(keyword);
    await page.emulateMedia({ colorScheme: "light" });
    // The token follows the layer, which follows the color scheme of the page.
    await test.expect.poll(() => getColor(keyword)).not.toBe(darkColor);
    await page.emulateMedia({ colorScheme: "dark" });
    await test.expect.poll(() => getColor(keyword)).toBe(darkColor);
  });
});
