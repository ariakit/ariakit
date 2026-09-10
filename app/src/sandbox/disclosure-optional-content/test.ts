import { click, press, q } from "@ariakit/test";
import { expect, test } from "vitest";

// https://github.com/ariakit/ariakit/pull/5240#discussion_r3974550076
test("omits a false label while keeping the description", async () => {
  const button = q.button("Optional title");
  expect(button).not.toHaveAttribute("aria-labelledby");
  expect(button).toHaveAccessibleDescription("Optional title");
  expect(button.querySelectorAll("span[id]")).toHaveLength(1);
  await click(button);
  expect(q.text("Optional settings")).toBeVisible();
});

// https://github.com/ariakit/ariakit/pull/5240#discussion_r3974549543
test("renders a zero icon before the label and the default indicator", async () => {
  const button = q.button(/Unread messages$/);
  expect(button).toHaveTextContent("0Unread messages");
  expect(button.firstElementChild).toHaveTextContent("0");
  expect(button.lastElementChild).toHaveAttribute("data-disclosure-indicator");
  await click(button);
  expect(q.text("No unread messages")).toBeVisible();
});

// https://github.com/ariakit/ariakit/pull/5240#discussion_r3974019389
test("preserves a zero description and omits a false description", async () => {
  const button = q.button("Pending requests");
  expect(button).toHaveAccessibleDescription("0");
  expect(button).toHaveTextContent("Pending requests0");
  await click(button);
  expect(q.text("No requests need review")).toBeVisible();
  const archived = q.button("Archived requests");
  expect(archived).not.toHaveAttribute("aria-describedby");
  expect(archived).not.toHaveAttribute("aria-labelledby");
});

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
