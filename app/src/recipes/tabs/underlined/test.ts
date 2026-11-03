import { click, press, q } from "@ariakit/test";
import { expect, test } from "vitest";

test("shows the panel of the selected flat tab", async () => {
  expect(q.tabpanel("Profile")).toHaveTextContent("Your name");
  await click(q.tab("Security"));
  expect(q.tabpanel("Security")).toHaveTextContent("Two-step");
  await press.ArrowRight();
  expect(q.tab("Billing")).toHaveFocus();
  expect(q.tabpanel("Billing")).toHaveTextContent("plan renews");
});
