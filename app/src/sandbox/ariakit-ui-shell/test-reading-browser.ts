import { expect } from "@playwright/test";
import { withFramework } from "#app/test-utils/preview.ts";
import { getBox, selectScenario } from "./test-helpers.ts";

withFramework(import.meta.dirname, async ({ test }) => {
  test.use({ viewport: { width: 1440, height: 900 } });

  test.beforeEach(async ({ q }) => {
    await selectScenario(q, "reading");
  });

  test("keeps the shell's text and a 42rem column without a main size", async ({
    q,
  }) => {
    await expect(q.text("Body prose")).toHaveCSS("font-size", "16px");
    await expect(q.text("Plain text")).toHaveCSS("font-size", "14px");
    await expect(q.button("Unsized button")).toHaveCSS("font-size", "14px");
    await expect(q.text("Page header")).toHaveCSS("font-size", "14px");
    expect((await getBox(q.text("Body prose"))).width).toBeCloseTo(672, 0);
  });

  for (const { size, text, column } of [
    { size: "sm", text: 14, column: 588 },
    { size: "md", text: 16, column: 672 },
    { size: "lg", text: 18, column: 756 },
  ]) {
    test(`sets main's text and a 42em column at ${size}, and bars keep the shell's text`, async ({
      q,
    }) => {
      await q.combobox("Main size").selectOption(size);
      const textSize = `${text}px`;
      await expect(q.text("Body prose")).toHaveCSS("font-size", textSize);
      await expect(q.text("Intro prose")).toHaveCSS("font-size", textSize);
      await expect(q.text("Plain text")).toHaveCSS("font-size", textSize);
      await expect(q.button("Unsized button")).toHaveCSS("font-size", textSize);
      await expect(q.text("Page header")).toHaveCSS("font-size", "14px");
      await expect(q.text("Page header")).toHaveCSS("line-height", "20px");
      await expect(q.text("Site header")).toHaveCSS("font-size", "14px");
      const body = await getBox(q.text("Body prose"));
      expect(body.width).toBeCloseTo(column, 0);
      for (const name of ["Page header", "Intro prose"]) {
        const part = await getBox(q.text(name));
        expect(part.x).toBeCloseTo(body.x, 0);
        expect(part.width).toBeCloseTo(body.width, 0);
      }
    });
  }

  test("keeps every column aligned when a part changes its own text", async ({
    q,
  }) => {
    await q.combobox("Main size").selectOption("lg");
    await q.checkbox("Smaller intro").click();
    await expect(q.text("Intro prose")).toHaveCSS("font-size", "12px");
    const intro = await getBox(q.text("Intro prose"));
    const body = await getBox(q.text("Body prose"));
    expect(intro.x).toBeCloseTo(body.x, 0);
    expect(intro.width).toBeCloseTo(756, 0);
    expect(body.width).toBeCloseTo(756, 0);
  });

  test("follows the text around Prose unless Prose sets its own size", async ({
    q,
  }) => {
    await expect(q.text("Prose in smaller text")).toHaveCSS(
      "font-size",
      "16px",
    );
    await q.combobox("Main size").selectOption("lg");
    await expect(q.text("Prose in smaller text")).toHaveCSS(
      "font-size",
      "12px",
    );
    await expect(q.text("Prose with its own size")).toHaveCSS(
      "font-size",
      "14px",
    );
    await expect(q.text("Prose with its own size")).toHaveCSS(
      "line-height",
      "22.75px",
    );
  });

  test("lets a maximum width replace the column of the size", async ({ q }) => {
    await q.combobox("Main size").selectOption("lg");
    await q.checkbox("Wider column").click();
    await expect
      .poll(async () => (await getBox(q.text("Body prose"))).width)
      .toBeCloseTo(800, 0);
  });

  test("stops the main size at a shell inside it", async ({ q }) => {
    await q.combobox("Main size").selectOption("lg");
    await expect(q.text("Automatic panel header")).toHaveCSS(
      "font-size",
      "14px",
    );
    await expect(q.text("Automatic panel header")).toHaveCSS(
      "line-height",
      "20px",
    );
    await expect(q.text("Automatic panel prose")).toHaveCSS(
      "font-size",
      "16px",
    );
    await expect(q.text("Large panel header")).toHaveCSS("font-size", "18px");
    await expect(q.text("Large panel prose")).toHaveCSS("font-size", "16px");
    await expect(q.text("Sized panel header")).toHaveCSS("font-size", "14px");
    await expect(q.text("Sized panel prose")).toHaveCSS("font-size", "18px");
  });

  test("steps large main text down in a small shell unless the minimum size keeps it", async ({
    page,
    q,
  }) => {
    await q.combobox("Main size").selectOption("lg");
    await expect(q.text("Plain text")).toHaveCSS("font-size", "18px");
    // At exactly 40rem, this shell keeps the large text. The narrower nested
    // shell doesn't, so the query reads the nearest shell, not the viewport.
    // The page fits this height, as a scrollbar would narrow the shell below
    // 40rem.
    await page.setViewportSize({ width: 640, height: 1200 });
    await expect(q.text("Plain text")).toHaveCSS("font-size", "18px");
    await expect(q.text("Sized panel prose")).toHaveCSS("font-size", "16px");
    await page.setViewportSize({ width: 480, height: 900 });
    await expect(q.text("Plain text")).toHaveCSS("font-size", "16px");
    await expect(q.text("Plain text")).toHaveCSS("line-height", "24px");
    await expect(q.button("Unsized button")).toHaveCSS("font-size", "16px");
    await expect(q.text("Body prose")).toHaveCSS("font-size", "16px");
    await expect(q.text("Page header")).toHaveCSS("font-size", "14px");
    await expect(q.text("Page header")).toHaveCSS("line-height", "20px");
    await expect(q.text("Site header")).toHaveCSS("font-size", "14px");
    await q.combobox("Main minimum size").selectOption("lg");
    await expect(q.text("Plain text")).toHaveCSS("font-size", "18px");
    await expect(q.text("Plain text")).toHaveCSS("line-height", "28px");
    await expect(q.text("Body prose")).toHaveCSS("font-size", "18px");
  });

  test("keeps other main sizes in a small shell", async ({ page, q }) => {
    await page.setViewportSize({ width: 480, height: 900 });
    await expect(q.text("Plain text")).toHaveCSS("font-size", "14px");
    await expect(q.text("Body prose")).toHaveCSS("font-size", "16px");
    await q.combobox("Main size").selectOption("md");
    await expect(q.text("Plain text")).toHaveCSS("font-size", "16px");
    await q.combobox("Main size").selectOption("sm");
    await expect(q.text("Plain text")).toHaveCSS("font-size", "14px");
    await q.combobox("Main minimum size").selectOption("lg");
    await expect(q.text("Plain text")).toHaveCSS("font-size", "14px");
    await q.combobox("Main size").selectOption("md");
    await expect(q.text("Plain text")).toHaveCSS("font-size", "16px");
  });

  test("keeps the default gutter on the edge of the bars", async ({
    page,
    q,
  }) => {
    await page.setViewportSize({ width: 480, height: 900 });
    for (const size of ["auto", "lg"]) {
      await q.combobox("Main size").selectOption(size);
      const bar = await getBox(q.text("Site header"));
      await expect
        .poll(async () => (await getBox(q.text("Body prose"))).x)
        .toBeCloseTo(bar.x, 0);
      expect((await getBox(q.text("Page header"))).x).toBeCloseTo(bar.x, 0);
    }
  });
});
