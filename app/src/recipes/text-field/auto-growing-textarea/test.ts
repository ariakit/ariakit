import { click, press, q, type } from "@ariakit/test";
import { expect, test } from "vitest";

function getMessages() {
  return q.within(q.list("Messages")).listitem.all();
}

test("sends the message with Enter and clears the field", async () => {
  await type("On it", q.textbox("Message"));
  await press.Enter(q.textbox("Message"));
  expect(getMessages()).toHaveLength(4);
  expect(getMessages().at(-1)).toHaveTextContent("On it");
  expect(q.textbox("Message")).toHaveValue("");
  expect(q.textbox("Message")).toHaveFocus();
});

test("adds a line with Shift+Enter instead of sending", async () => {
  await type("On it", q.textbox("Message"));
  await press.Enter(q.textbox("Message"), { shiftKey: true });
  expect(getMessages()).toHaveLength(3);
  expect(q.textbox("Message")).toHaveValue("On it\n");
});

test("sends the message with the send button and skips empty drafts", async () => {
  await click(q.button("Send message"));
  expect(getMessages()).toHaveLength(3);
  await type("Sending by 11", q.textbox("Message"));
  await click(q.button("Send message"));
  expect(getMessages()).toHaveLength(4);
  expect(getMessages().at(-1)).toHaveTextContent("Sending by 11");
});
