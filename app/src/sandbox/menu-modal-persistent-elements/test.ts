import { click, q } from "@ariakit/test";
import { expect, test } from "vitest";

// The dialog collects persistent elements from an effect that doesn't depend
// on the disclosure, so swapping one connected disclosure for another used to
// leave the old one in the modal context and the new one inert, while
// `aria-labelledby` already pointed at the new one.
// https://github.com/ariakit/ariakit/pull/7303#discussion_r3884581660
test("swapping the disclosure moves it into the modal context", async () => {
  await click(q.button("Actions"));
  expect(q.menu()).toBeVisible();
  expect(q.button.maybe("Actions")).toBeInTheDocument();
  expect(q.button.maybe("Other")).not.toBeInTheDocument();

  await click(q.menuitem("Use other trigger"));

  expect(q.menu()).toBeVisible();
  expect(q.button.maybe("Other")).toBeInTheDocument();
  expect(q.button.maybe("Actions")).not.toBeInTheDocument();
});
