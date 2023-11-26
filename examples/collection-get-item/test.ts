import { q } from "@ariakit/test";

test("should register item using getItem function", async () => {
  expect(await q.text.wait("Custom items: 1")).toBeInTheDocument();
});
