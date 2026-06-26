import { click, q } from "@ariakit/test";
import { expect, test } from "vitest";

// Reproduces https://github.com/ariakit/ariakit/issues/6293

function activeFieldName() {
  return document.activeElement?.getAttribute("name") ?? null;
}

test("FormPush focuses the field it creates after an existing item", async () => {
  await click(q.button("Add tag"));
  expect(activeFieldName()).toBe("tags.1");
  expect(q.status()).toHaveTextContent("Focused field: tags.1");
});

test("FormPush keeps auto-focusing fields in an initially empty array", async () => {
  await click(q.button("Add email"));
  expect(activeFieldName()).toBe("emails.0");
  expect(q.status()).toHaveTextContent("Focused field: emails.0");

  await click(q.button("Add email"));
  expect(activeFieldName()).toBe("emails.1");
  expect(q.status()).toHaveTextContent("Focused field: emails.1");
});
