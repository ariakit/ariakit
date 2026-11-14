import { test } from "#app/test-utils/fixtures.ts";
import { withFramework } from "#app/test-utils/preview.ts";

// The launch scale makes Chromium snap borders to device pixels. Neither
// context deviceScaleFactor nor computed geometry shows that, so the test reads
// pixels.
test.use({
  launchOptions: { args: ["--force-device-scale-factor=1.5"] },
  deviceScaleFactor: 1.5,
  viewport: { width: 1280, height: 800 },
});

withFramework(import.meta.dirname, async ({ test }) => {
  // https://github.com/ariakit/ariakit/issues/8234
  test("keeps the guide on one device pixel column at scale 1.5", async ({
    page,
    q,
  }) => {
    await page.addStyleTag({
      content: `
        .toc { --nav-guide-color: #f0f !important; }
        .toc-link-bar, .toc-link-marker { display: none !important; }
        .toc-link-guide { mask: none !important; }
        .toc a { background: transparent !important; }
      `,
    });
    test.expect(await page.evaluate(() => devicePixelRatio)).toBe(1.5);
    const names = ["Numbered steps", "Dot steps", "Right to left, dot steps"];
    for (const name of names) {
      const nav = q.navigation(name);
      await nav.scrollIntoViewIfNeeded();
      // The position of a table of contents decides which edges snap apart.
      for (const offset of [0, 0.2, 0.4, 0.6, 0.8]) {
        await nav.evaluate((element, offset) => {
          element.style.marginInlineStart = `${offset}px`;
        }, offset);
        const shot = await page.screenshot({ scale: "device" });
        const jogs = await nav.evaluate(async (element, data) => {
          const image = new Image();
          image.src = `data:image/png;base64,${data}`;
          await image.decode();
          const canvas = document.createElement("canvas");
          canvas.width = image.width;
          canvas.height = image.height;
          const context = canvas.getContext("2d");
          if (!context) return ["no canvas"];
          context.drawImage(image, 0, 0);
          const { data: pixels } = context.getImageData(
            0,
            0,
            image.width,
            image.height,
          );
          const getPaint = (x: number, y: number) => {
            const index = (y * image.width + x) * 4;
            // Red without green is the guide, unlike the text and the surface.
            return (pixels[index] ?? 0) - (pixels[index + 1] ?? 0);
          };
          const nav = element.getBoundingClientRect();
          const start = Math.floor(nav.left * devicePixelRatio);
          const end = Math.ceil(nav.right * devicePixelRatio);
          const links = [...element.querySelectorAll("a")];
          const rows = links.map((link) => {
            const box = link.getBoundingClientRect();
            const guide = link.querySelector(".toc-link-guide");
            const bottom = guide?.getBoundingClientRect().bottom ?? 0;
            const y = Math.round((box.top + box.height / 2) * devicePixelRatio);
            const columns: number[] = [];
            for (let x = start; x < end; x++) {
              if (getPaint(x, y) > 200) columns.push(x);
            }
            return {
              name: link.textContent,
              list: link.closest("ul, ol"),
              bottom: Math.round(bottom * devicePixelRatio),
              column: columns.join(),
              columnCount: columns.length,
            };
          });
          const found: string[] = [];
          const firstRows = new Map<Element | null, (typeof rows)[number]>();
          for (const [index, row] of rows.entries()) {
            if (row.columnCount !== 1) {
              found.push(`${row.name} paints columns [${row.column}]`);
            }
            const first = firstRows.get(row.list) ?? row;
            firstRows.set(row.list, first);
            if (row.column !== first.column) {
              found.push(
                `${first.name} ${first.column}, ${row.name} ${row.column}`,
              );
            }
            if (!rows[index + 1]) continue;
            // A bend starts on the column of the line that it continues.
            if (getPaint(Number(row.column), row.bottom) < 50) {
              found.push(`the guide leaves ${row.column} after ${row.name}`);
            }
          }
          return found;
        }, shot.toString("base64"));
        test.expect(jogs, `${name} at ${offset}`).toEqual([]);
      }
    }
  });
});
