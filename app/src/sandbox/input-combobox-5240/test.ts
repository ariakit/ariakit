import { click, hover, press, q, type } from "@ariakit/test";
import { expect, test } from "vitest";

// https://github.com/ariakit/ariakit/pull/5240#discussion_r3972224343
test("keeps an editable input when an optional render is undefined", async () => {
  await click(q.textbox("Project name"));
  await type("Website");
  expect(q.text("Project: Website")).toBeVisible();
  await click(q.textbox("Notes"));
  await type("First line\nSecond line");
  expect(q.textbox("Notes")).toHaveValue("First line\nSecond line");
});

// https://github.com/ariakit/ariakit/pull/5240#discussion_r3972224343
test("keeps the hovered suggestion active with optional hover props", async () => {
  await click(q.combobox("Assignee"));
  await hover(q.option("Bob"));
  await hover(q.combobox("Assignee"));
  await press.Enter();
  expect(q.combobox("Assignee")).toHaveValue("Bob");
  expect(q.listbox.maybe()).not.toBeInTheDocument();
});
