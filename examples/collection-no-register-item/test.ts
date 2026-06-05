import { expect, test, q } from "../../browser-test-utils.ts";

test("should not count unregistered items", async () => {
  expect(await q.text.wait("Items count: 2")).toBeInTheDocument();
});
