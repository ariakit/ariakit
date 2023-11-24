import { q } from "@ariakit/test";

test("should not count unregistered items", async () => {
  expect(await q.text.wait("Items count: 2")).toBeInTheDocument();
});
