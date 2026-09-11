import { click, press, q } from "@ariakit/test";
import { expect, test } from "vitest";
import { mountExamples } from "./mount.react.test-helper.ts";
import { TabsFixturesExamples } from "./pages/tabs-fixtures.react.tsx";

mountExamples(TabsFixturesExamples);

function getBox() {
  return q.within(q.article("Tab panel shared store"));
}

for (const name of ["Project", "Team"]) {
  // https://github.com/ariakit/ariakit/pull/5240#discussion_r3973781700
  test(`keeps the ${name.toLowerCase()} panel visible with an explicit store`, async () => {
    const box = getBox();
    expect(box.tabpanel(`${name} activity`)).toBeVisible();
    await click(box.tab(`${name} reviews`));
    expect(box.tabpanel(`${name} reviews`)).toBeVisible();
    expect(box.text(`${name} review updates`)).toBeVisible();
    await click(box.tab(`${name} activity`));
    expect(box.tabpanel(`${name} activity`)).toBeVisible();
    expect(box.text(`${name} activity updates`)).toBeVisible();
  });
}

// https://github.com/ariakit/ariakit/pull/5240#discussion_r3973781700
test("preserves an explicit tabId on a single panel", async () => {
  const box = getBox();
  const panel = box.tabpanel("Pinned activity");
  expect(panel).toBeVisible();
  await click(box.tab("Pinned reviews"));
  expect(box.tab("Pinned reviews")).toHaveAttribute("aria-selected", "true");
  expect(panel).not.toBeVisible();
  await click(box.tab("Pinned activity"));
  expect(box.tabpanel("Pinned activity")).toBeVisible();
});

test("a tabs record keys its tabs and passes tab props", async () => {
  const box = q.within(q.article("Tabs record"));
  // defaultSelectedId names a record key, so the keys are the tab ids.
  expect(box.tab("Usage")).toHaveAttribute("aria-selected", "true");
  expect(box.tab("Code")).toHaveAttribute("aria-disabled", "true");

  await click(box.tab("Preview"));
  expect(box.tab("Preview")).toHaveAttribute("aria-selected", "true");
  await press.ArrowRight();
  expect(box.tab("Code")).toHaveFocus();
  expect(box.tab("Code")).toHaveAttribute("aria-selected", "false");
  expect(box.tab("Preview")).toHaveAttribute("aria-selected", "true");
  await press.ArrowRight();
  expect(box.tab("Usage")).toHaveAttribute("aria-selected", "true");
});
