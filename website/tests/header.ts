import { expect, test } from "@playwright/test";

test("truncates a long page title without overflowing the header", async ({
  page,
}) => {
  await page.goto("/examples/select-next-router");

  const currentPage = page.getByRole("combobox", { name: "Current page" });
  const title = currentPage.locator(".truncate");

  await expect(title).toHaveText("Combobox Select with Next.js App Router");
  await expect(title).toHaveCSS("text-overflow", "ellipsis");

  const metrics = await title.evaluate((element) => {
    const header = element.closest(".sticky");
    if (!header) {
      throw new Error("Header not found");
    }
    return {
      titleClientWidth: element.clientWidth,
      titleScrollWidth: element.scrollWidth,
      headerClientWidth: header.clientWidth,
      headerScrollWidth: header.scrollWidth,
    };
  });

  expect(metrics.titleScrollWidth).toBeGreaterThan(metrics.titleClientWidth);
  expect(metrics.headerScrollWidth).toBeLessThanOrEqual(
    metrics.headerClientWidth,
  );
});
