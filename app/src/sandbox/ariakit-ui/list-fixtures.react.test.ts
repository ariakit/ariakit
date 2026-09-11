import { click, q } from "@ariakit/test";
import { expect, test } from "vitest";
import { mountExamples } from "./mount.react.test-helper.ts";
import { ListFixturesExamples } from "./pages/list-fixtures.react.tsx";

mountExamples(ListFixturesExamples);

// https://github.com/ariakit/ariakit/pull/5240#discussion_r3973584702
test("omits a conditional list button without hiding its content", async () => {
  const scope = q.within(q.article("list-disclosure-optional-button"));
  expect(scope.text("Review assigned issues")).toBeVisible();
  expect(scope.button.all(/^$/)).toHaveLength(0);

  await click(scope.checkbox("Show task headings"));
  expect(scope.button("Project tasks")).toBeVisible();
  expect(scope.text("Review assigned issues")).not.toBeVisible();
  await click(scope.button("Project tasks"));
  expect(scope.text("Review assigned issues")).toBeVisible();
  await click(scope.button("Project tasks"));
  expect(scope.text("Review assigned issues")).not.toBeVisible();

  await click(scope.checkbox("Show task headings"));
  expect(scope.text("Review assigned issues")).toBeVisible();
  expect(scope.button.maybe("Project tasks")).not.toBeInTheDocument();
  expect(scope.button.all(/^$/)).toHaveLength(0);
});

// https://github.com/ariakit/ariakit/pull/5240#discussion_r3973584702
test("keeps zero as a list button label", async () => {
  const scope = q.within(q.article("list-disclosure-optional-button"));
  const button = scope.button("0");
  expect(button).toBeVisible();
  expect(button).toHaveAttribute("aria-expanded", "false");
  await click(button);
  expect(button).toHaveAttribute("aria-expanded", "true");
  expect(scope.text("No pending tasks")).toBeVisible();
});

// https://github.com/ariakit/ariakit/pull/5240#discussion_r3973781710
test("uses progress as the default check state and preserves explicit values", () => {
  const scope = q.within(q.article("list-item-marker-checked"));
  const completed = q.within(scope.list("Completed progress"));
  const unchecked = q.within(scope.list("Explicit unchecked state"));
  const checked = q.within(scope.list("Explicit checked state"));
  expect(completed.img("Checked")).toBeVisible();
  expect(unchecked.img("Unchecked")).toBeVisible();
  expect(checked.img("Checked")).toBeVisible();
});
