import { expect, test } from "@playwright/test";
import { getCaptureSections } from "#app/test-utils/ariviso-pages.ts";

const sections = [
  { key: "first", title: "First example" },
  { key: "second", title: "Second example" },
  { key: "last", title: "Last example" },
];

const fixture = `
  <main style="display:grid;grid-template-columns:repeat(3,1fr);gap:16px">
    <article aria-label="First example">First</article>
    <article aria-label="Second example">Second</article>
    <article aria-label="Last example">Last</article>
  </main>
`;

test("keeps capture identities through reflow and a taller page", async ({
  page,
}) => {
  await page.setContent(fixture);
  const main = page.getByRole("main");
  const before = await getCaptureSections(main, sections);
  await main.evaluate((element) => {
    element.style.gridTemplateColumns = "1fr";
    element.style.gap = "700px";
  });
  const bounds = await main.boundingBox();
  expect(bounds?.height).toBeGreaterThan(1280);
  const after = await getCaptureSections(main, sections);
  expect(after.map((section) => section.key)).toEqual(
    before.map((section) => section.key),
  );
  const last = after[2];
  if (!last) {
    throw new Error("The last capture section is missing");
  }
  await expect(last.element).toHaveText("Last");
});

test("keeps existing identities when a declared section is added or renamed", async ({
  page,
}) => {
  await page.setContent(fixture);
  const main = page.getByRole("main");
  await main.evaluate((element) => {
    element.insertAdjacentHTML(
      "beforeend",
      '<article aria-label="New example">New</article>',
    );
    element.firstElementChild?.setAttribute(
      "aria-label",
      "Renamed first example",
    );
  });
  const renamed = { key: "first", title: "Renamed first example" };
  const captures = await getCaptureSections(main, [
    renamed,
    ...sections.slice(1),
    { key: "new", title: "New example" },
  ]);
  expect(captures.map((section) => section.key)).toEqual([
    "first",
    "second",
    "last",
    "new",
  ]);
  const first = captures[0];
  if (!first) {
    throw new Error("The first capture section is missing");
  }
  await expect(first.element).toHaveText("First");
});

test("refuses undeclared sections and duplicate capture identities", async ({
  page,
}) => {
  await page.setContent(fixture);
  const main = page.getByRole("main");
  await expect(getCaptureSections(main, sections.slice(0, 2))).rejects.toThrow(
    "explicit capture declarations",
  );
  const [first, second, last] = sections;
  if (!first || !second || !last) {
    throw new Error("The capture section fixture is incomplete");
  }
  await expect(
    getCaptureSections(main, [
      first,
      { key: "first", title: "Second example" },
      last,
    ]),
  ).rejects.toThrow("unique explicit keys");
  await expect(
    getCaptureSections(main, [
      first,
      second,
      { key: "last", title: "Missing example" },
    ]),
  ).rejects.toThrow("missing or ambiguous");
});
