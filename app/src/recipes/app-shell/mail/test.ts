import { click, q } from "@ariakit/test";
import { expect, test } from "vitest";

test("counts the messages in the selected folder", async () => {
  expect(q.text("6 messages")).toBeInTheDocument();
  await click(q.link(/^Sent/));
  expect(q.text("1 message")).toBeInTheDocument();
});

test("keeps the message list out of the navigation landmarks", () => {
  const messages = q.complementary("Messages");
  expect(q.within(messages).link(/^Maya Chen/)).toBeInTheDocument();
  expect(q.within(messages).navigation.all()).toHaveLength(0);
  expect(q.within(q.navigation("Mailboxes")).navigation.all()).toHaveLength(0);
});
