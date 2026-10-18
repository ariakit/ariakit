import { click, press, q } from "@ariakit/test";
import { expect, test } from "vitest";

// https://github.com/ariakit/ariakit/pull/7536#discussion_r4022810357
test("changes bar placement keyboard navigation to right-to-left order", async () => {
  await click(q.checkbox("Tabs right to left"));
  const tabs = q.within(q.tablist("Bar placement"));
  await click(tabs.tab("Preview"));
  await press.ArrowLeft();
  expect(tabs.tab("Code")).toHaveFocus();
  expect(tabs.tab("Code")).toHaveAttribute("aria-selected", "true");
  await press.ArrowLeft();
  expect(tabs.tab("Project settings")).toHaveFocus();
  expect(tabs.tab("Project settings")).toHaveAttribute("aria-selected", "true");
});

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

// https://github.com/ariakit/ariakit/issues/7961
test("omits false and true tabs array entries from keyboard navigation", async () => {
  const box = q.within(q.article("Conditional tabs"));
  const tabs = q.within(box.tablist("Project pages"));
  const checkbox = box.checkbox("Can edit project settings");
  const getNames = () => tabs.tab.all().map((tab) => tab.textContent);
  // Without edit access, the Settings entry is false.
  expect(getNames()).toEqual(["Overview", "Request access", "Activity"]);
  const activity = tabs.tab("Activity");
  await click(tabs.tab("Overview"));
  await press.ArrowRight();
  expect(tabs.tab("Request access")).toHaveFocus();
  await press.ArrowRight();
  expect(activity).toHaveFocus();
  expect(activity).toHaveAttribute("aria-selected", "true");
  expect(box.tabpanel("Activity")).toHaveTextContent("Project activity");

  // With edit access, the Request access entry is true.
  await click(checkbox);
  expect(getNames()).toEqual(["Overview", "Settings", "Activity"]);
  // The surviving tab keeps its element when the entries around it change.
  expect(tabs.tab("Activity")).toBe(activity);
  await click(tabs.tab("Overview"));
  await press.ArrowRight();
  expect(tabs.tab("Settings")).toHaveFocus();
  expect(box.tabpanel("Settings")).toHaveTextContent("Project settings");
  await press.ArrowRight();
  expect(activity).toHaveFocus();

  await click(checkbox);
  expect(getNames()).toEqual(["Overview", "Request access", "Activity"]);
  expect(tabs.tab("Activity")).toBe(activity);
});

// https://github.com/ariakit/ariakit/issues/7961
test("omits null and undefined tabs record entries from keyboard navigation", async () => {
  const box = q.within(q.article("Conditional tabs"));
  const tabs = q.within(box.tablist("Project pages record"));
  const getNames = () => tabs.tab.all().map((tab) => tab.textContent);
  // Without edit access, the Settings entry is undefined.
  expect(getNames()).toEqual(["Overview", "Request access", "Activity"]);
  await click(tabs.tab("Overview"));
  await press.ArrowRight();
  expect(tabs.tab("Request access")).toHaveFocus();
  expect(tabs.tab("Request access")).toHaveAttribute(
    "id",
    "conditional-record-request",
  );
  await press.ArrowRight();
  expect(tabs.tab("Activity")).toHaveFocus();

  // With edit access, the Request access entry is null.
  await click(box.checkbox("Can edit project settings"));
  expect(getNames()).toEqual(["Overview", "Settings", "Activity"]);
  expect(tabs.tab("Settings")).toHaveAttribute(
    "id",
    "conditional-record-settings",
  );
  await click(tabs.tab("Overview"));
  await press.ArrowRight();
  expect(tabs.tab("Settings")).toHaveFocus();
  await press.ArrowRight();
  expect(tabs.tab("Activity")).toHaveFocus();
});
