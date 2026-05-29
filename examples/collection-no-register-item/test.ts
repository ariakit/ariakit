import { q } from "@ariakit/test";
import { expect, test } from "vitest";

test("should not count unregistered items", async () => {
  expect(await q.text.wait("Items count: 2")).toBeInTheDocument();
});
