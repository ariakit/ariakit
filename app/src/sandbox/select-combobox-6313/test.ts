import { q } from "@ariakit/test";
import { expect, test } from "vitest";

// See https://github.com/ariakit/ariakit/issues/6313
test("keeps hoisted and provider select values in sync after init", () => {
  expect(q.combobox.ensure("Favorite fruit")).toHaveTextContent("Banana");
  expect(q.text.ensure("Committed value: Banana")).toBeVisible();
});
