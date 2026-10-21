import { click, q } from "@ariakit/test";
import { version } from "react";
import { expect, test } from "vitest";

// https://github.com/ariakit/ariakit/pull/7863
test("keeps button slots accessible unless explicitly hidden", () => {
  const button = q.within(q.article("Decorative icon")).button(/Add item/);
  expect(button).toHaveAccessibleName("Add item");
  expect(q.within(button).text("+")).toHaveAttribute("aria-hidden", "true");
  expect(
    q.within(q.article("Count badge")).button("Inbox 12"),
  ).toHaveAccessibleName("Inbox 12");
  expect(
    q.within(q.article("Meaningful icon")).button("Starred Project"),
  ).toHaveAccessibleName("Starred Project");
  expect(q.within(q.article("Meaningful icon")).img("Starred")).toBeVisible();
});

test("renders a button as a native submit input", () => {
  expect(
    q.within(q.article("Native submit input")).button("Submit form"),
  ).toHaveAttribute("type", "submit");
});

// This gallery uses React 19 ref props, as declared by @ariakit/ui.
// https://github.com/ariakit/ariakit/pull/7489#discussion_r3995226174
test.skipIf(version.startsWith("18."))(
  "preserves the selected avatar color when its kind changes",
  async () => {
    const picture = q.button("Change avatar color");
    const image = () => q.button("Change avatar color").querySelector("img");
    expect(image()).toHaveAttribute("src", expect.stringContaining("f59e0b"));
    await click(picture);
    expect(image()).toHaveAttribute("src", expect.stringContaining("6366f1"));
    const round = q.button("Round avatar");
    await click(round);
    expect(round).toHaveAttribute("aria-pressed", "false");
    expect(image()).toHaveAttribute("src", expect.stringContaining("6366f1"));
    await click(round);
    expect(round).toHaveAttribute("aria-pressed", "true");
    expect(image()).toHaveAttribute("src", expect.stringContaining("6366f1"));
  },
);
