import { click, q } from "@ariakit/test";
import { expect, test } from "vitest";

test("counts the messages in the selected folder", async () => {
  expect(q.text("6 messages")).toBeInTheDocument();
  await click(q.link(/^Sent/));
  expect(q.text("1 message")).toBeInTheDocument();
});
