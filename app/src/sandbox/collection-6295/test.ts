import { click, q } from "@ariakit/test";
import { expect, test } from "vitest";

// https://github.com/ariakit/ariakit/issues/6295
test("item() returns the metadata listed in the items state", async () => {
  await click(q.button("Apple"));
  expect(q.status()).toHaveTextContent(/^Apple$/);
});

test("item() reflects controlled items updates", async () => {
  await click(q.button("Rename Apple"));
  await click(q.button("Green Apple"));
  expect(q.status()).toHaveTextContent(/^Green Apple$/);
});

test("item() finds items added to the items state without rendering", async () => {
  await click(q.button("Add Kiwi"));
  expect(q.button("Kiwi")).not.toBeInTheDocument();
  await click(q.button("Show Kiwi details"));
  expect(q.status()).toHaveTextContent(/^Kiwi$/);
});
