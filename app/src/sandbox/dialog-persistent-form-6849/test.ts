import { click, q } from "@ariakit/test";
import { expect, test } from "vitest";

// https://github.com/ariakit/ariakit/issues/6849
test("keeps descendants of a persistent form inside the dialog context", async () => {
  await click(q.button("Open dialog"));
  expect(q.dialog("Dialog")).toBeVisible();

  await click(q.textbox("Persistent field"));
  expect(q.textbox("Persistent field")).toHaveFocus();
  expect(q.dialog("Dialog")).toBeVisible();

  await click(q.textbox("Outside field"));
  await expect.poll(q.dialog.hidden.lazy("Dialog")).not.toBeVisible();
});
