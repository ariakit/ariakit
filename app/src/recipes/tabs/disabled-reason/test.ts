import { click, press, q } from "@ariakit/test";
import { expect, test } from "vitest";

test("describes the disabled tab and doesn't select it", async () => {
  await click(q.tab("Members"));
  await press.ArrowLeft();
  const tab = q.tab("Audit log");
  expect(tab).toHaveFocus();
  expect(tab).toHaveAttribute("aria-selected", "false");
  expect(tab).toHaveAccessibleDescription(
    "Audit log is part of the Business plan.",
  );
  expect(q.tabpanel("Members")).toBeVisible();
});
