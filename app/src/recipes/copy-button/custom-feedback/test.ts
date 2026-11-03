import { click, q } from "@ariakit/test";
import { expect, test } from "vitest";

test("shows the custom text after a copy", async () => {
  await click(q.button("Copy the test key"));
  expect(await q.status.wait("Key copied")).toBeInTheDocument();
});
