import { click, q } from "@ariakit/test";
import { expect, test } from "vitest";

// Validates the userland workaround for
// https://github.com/ariakit/ariakit/issues/6219: with safe field names
// (`relatedTags` instead of `tags2`, `cpp` instead of `c++`), FormPush and
// FormRemove behave correctly on the unfixed library.

function activeFieldName() {
  return document.activeElement?.getAttribute("name") ?? null;
}

test("workaround: FormPush keeps focus within the target array when no sibling shares its name prefix", async () => {
  // `relatedTags` does not start with `tags`, so it isn't matched as part of
  // the `tags` array and focus stays on a `tags` field.
  await click(q.button("Add tag"));
  expect(activeFieldName()).toMatch(/^tags\.\d+$/);
});

test("workaround: FormPush works with an array name free of regex metacharacters", async () => {
  // `cpp` has no regex metacharacters, so building the auto-focus matcher does
  // not throw.
  await click(q.button("Add version"));
  expect(activeFieldName()?.startsWith("cpp.")).toBe(true);
});

test("workaround: FormRemove works with an array name free of regex metacharacters", async () => {
  // `cpp` has no regex metacharacters, so focus moves to the next field.
  await click(q.button("Remove cpp.0"));
  expect(activeFieldName()).toBe("cpp.1");
});
