import { click, press, q } from "@ariakit/test";
import { expect, test } from "vitest";

test("adds one history entry for each selected tab", async () => {
  await click(q.tab("Sent"));
  expect(q.tabpanel("Sent")).toHaveTextContent("You sent two messages today.");
  await click(q.tab("Drafts"));
  expect(q.tabpanel("Drafts")).toHaveTextContent(
    "One draft waits for your review.",
  );
  await click(q.button("Back"));
  expect(q.tabpanel("Sent")).toBeVisible();
  await click(q.button("Back"));
  expect(q.tabpanel("Inbox")).toBeVisible();
});

test("moves with the arrow keys and follows the link on Enter", async () => {
  await click(q.tab("Inbox"));
  await press.ArrowRight();
  expect(q.tab("Sent")).toHaveFocus();
  expect(q.tab("Inbox")).toHaveAttribute("aria-selected", "true");
  await press.Enter();
  expect(q.tabpanel("Sent")).toBeVisible();
  expect(q.tab("Sent")).toHaveFocus();
});
