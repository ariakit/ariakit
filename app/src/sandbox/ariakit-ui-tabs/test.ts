import { click, press, q } from "@ariakit/test";
import { expect, test } from "vitest";

// https://github.com/ariakit/ariakit/issues/7482
test("moves and selects tabs in right-to-left order", async () => {
  const box = q.within(q.article("Right to left"));
  const drafts = box.tab("المسودات");
  const review = box.tab("قيد المراجعة");
  const published = box.tab("المنشورة");

  await click(drafts);
  await press.ArrowLeft();
  expect(review).toHaveFocus();
  expect(review).toHaveAttribute("aria-selected", "true");
  await press.ArrowRight();
  expect(drafts).toHaveFocus();
  expect(drafts).toHaveAttribute("aria-selected", "true");
  await press.ArrowRight();
  expect(published).toHaveFocus();
  expect(published).toHaveAttribute("aria-selected", "true");
  await press.ArrowLeft();
  expect(drafts).toHaveFocus();
  expect(drafts).toHaveAttribute("aria-selected", "true");
});

for (const [name, label] of [
  ["Default", "Preview"],
  ["Overflowing strip", "Overview"],
  ["Tabs record", "Usage"],
  ["Tabs record", "Code"],
  ["folder tab with a long label", "Project settings and permissions"],
  ["flat tab with a long label", "Project settings and permissions"],
  ["bevel tab with a long label", "Project settings and permissions"],
] as const) {
  // https://github.com/ariakit/ariakit/issues/7482
  test(`renders a phrasing label in ${name}: ${label}`, () => {
    const tab = q.within(q.article(name)).tab(label);
    expect(tab.tagName).toBe("BUTTON");
    expect(q.within(tab).text(label, { exact: true }).tagName).toBe("SPAN");
  });
}
