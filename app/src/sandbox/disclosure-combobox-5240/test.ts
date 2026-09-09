import { click, press, q } from "@ariakit/test";
import { expect, test } from "vitest";

// https://github.com/ariakit/ariakit/pull/5240#discussion_r3972224162
test("omits optional headings without hiding the filters", async () => {
  expect(q.combobox("Assignee")).toBeVisible();
  expect(q.combobox("Status")).toBeVisible();
  expect(q.button.all(/^$/)).toHaveLength(0);
  expect(
    Array.from(document.querySelectorAll("label")).filter(
      (label) => !label.textContent,
    ),
  ).toHaveLength(0);
  await click(q.combobox("Assignee"));
  expect(q.option("Alice")).toBeVisible();
  expect(q.group()).not.toHaveAttribute("aria-labelledby");
  await press.Escape();
  await click(q.checkbox("Show filter headings"));
  expect(q.button("Project filters")).toBeVisible();
  expect(q.combobox.maybe("Assignee")).not.toBeInTheDocument();
  await click(q.button("Project filters"));
  expect(q.combobox("Assignee")).toBeVisible();
  await click(q.combobox("Assignee"));
  expect(q.group("Team")).toBeVisible();
  await press.Escape();
  await click(q.button("0"));
  expect(q.text("No pending requests")).toBeVisible();
});

// https://github.com/ariakit/ariakit/pull/5240#discussion_r3972224487
test("names a disclosure from its description without a missing label", async () => {
  const button = q.button("Advanced options");
  expect(button).not.toHaveAttribute("aria-labelledby");
  expect(button).toHaveAccessibleDescription("Advanced options");
  await click(button);
  expect(q.text("Advanced controls")).toBeVisible();
});
