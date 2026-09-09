import { query } from "@ariakit/test/playwright";
import { expect } from "@playwright/test";
import { test } from "#app/test-utils/fixtures.ts";
import { gotoAndSettle } from "#app/test-utils/preview.ts";

test("combobox sample and variant work in their iframes", async ({
  page,
  q,
}) => {
  await gotoAndSettle(page, "/react/examples/combobox-group/");

  for (const title of ["Combobox Group", "Custom Items"]) {
    const iframe = page.locator(`iframe[title="${title}"]`);
    await iframe.scrollIntoViewIfNeeded();
    const frame = iframe.contentFrame();
    await expect(frame.locator("html")).toHaveAttribute(
      "data-preview-hydrated",
      "",
    );
    const preview = query(frame);
    await preview.combobox("Find records").fill("annual");
    await expect(preview.option(/annual_report\.pdf/)).toBeVisible();
    await expect(preview.group("Files")).toBeVisible();
    if (title === "Custom Items") {
      await expect(preview.option(/annual_report\.pdf/)).toContainText(
        "Documents",
      );
    }
    await preview.option(/annual_report\.pdf/).click();
    await expect(preview.combobox("Find records")).toHaveValue(
      "annual_report.pdf",
    );
    await expect(preview.listbox()).not.toBeVisible();
    await preview.combobox("Find records").fill("No matching record");
    await expect(preview.text("No results found")).toBeVisible();
    await expect(preview.option()).toHaveCount(0);
  }

  const source = q.text("index.tsx", { exact: true }).first();
  await source.click();
  await expect(page.locator("details[open] code").first()).toContainText(
    "export default function Example",
  );
});

for (const framework of ["react", "solid"]) {
  test(`${framework} separator page uses its framework preview`, async ({
    page,
    q,
  }) => {
    await gotoAndSettle(page, `/${framework}/components/separator/`);
    await expect(q.separator()).toBeVisible();
    await expect(q.link("Separator", { exact: true }).first()).toHaveAttribute(
      "href",
      `/${framework}/previews/separator/_component/`,
    );
    await q.text("index.tsx", { exact: true }).click();
    await expect(page.locator("details[open] code")).toContainText(
      `@ariakit/${framework}`,
    );
  });
}
