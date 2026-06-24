import { click, q } from "@ariakit/test";
import { expect, test } from "vitest";

// Reproduces https://github.com/ariakit/ariakit/issues/6295
test("returns controlled item metadata from collection.item()", async () => {
  await click(q.button.ensure("Apple"));
  expect(q.status.ensure("Details")).toHaveTextContent("Apple");

  await click(q.button.ensure("Rename Apple"));
  await click(q.button.ensure("Green Apple"));
  expect(q.status.ensure("Details")).toHaveTextContent("Green Apple");
});
