import { click, q } from "@ariakit/test";
import { expect, test } from "vitest";

function activeFieldName() {
  return document.activeElement?.getAttribute("name") ?? null;
}

// Reproduces https://github.com/ariakit/ariakit/issues/6293
test("FormPush focuses the field it creates after an existing item", async () => {
  await click(q.button("Add tag"));
  expect(activeFieldName()).toBe("tags.2");
  expect(q.status()).toHaveTextContent("Focused field: tags.2");
});

test("FormPush keeps auto-focusing fields in an initially empty array", async () => {
  await click(q.button("Add email"));
  expect(activeFieldName()).toBe("emails.0");
  expect(q.status()).toHaveTextContent("Focused field: emails.0");

  await click(q.button("Add email"));
  expect(activeFieldName()).toBe("emails.1");
  expect(q.status()).toHaveTextContent("Focused field: emails.1");
});

// Reproduces https://github.com/ariakit/ariakit/issues/6219
test("FormPush keeps focus within the target array, not a sibling sharing the name prefix", async () => {
  // `tags` and `tags2` are separate arrays, and `tags` is a prefix of `tags2`.
  await click(q.button("Add tag"));
  // Auto-focus must stay on a `tags` field and never leak into the `tags2`
  // sibling, whose name shares the `tags` prefix.
  expect(activeFieldName()).toMatch(/^tags\.\d+$/);
});

test("FormRemove keeps focus within the target array, not a sibling sharing the name prefix", async () => {
  // Removing from `tags` must move focus to another `tags` field and never
  // leak into the `tags2` sibling, whose name shares the `tags` prefix.
  await click(q.button("Remove tags.0"));
  expect(activeFieldName()).toBe("tags.1");
});

test("FormPush keeps focus within an array whose name has regex metacharacters", async () => {
  // The `c++` array name contains regex metacharacters. Building the auto-focus
  // matcher must not throw, and focus must stay within the array.
  await click(q.button("Add version"));
  expect(activeFieldName()?.startsWith("c++.")).toBe(true);
});

test("FormRemove moves focus to the next field when the array name has regex metacharacters", async () => {
  // Removing the first `c++` item must move focus to the next field (`c++.1`)
  // without throwing on the metacharacter name.
  await click(q.button("Remove c++.0"));
  expect(activeFieldName()).toBe("c++.1");
});
