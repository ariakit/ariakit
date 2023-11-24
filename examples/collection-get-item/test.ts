import { q } from "@ariakit/test";

test("should register item using getItem function", async () => {
  expect(await q.text.wait("Purple items: 1")).toBeInTheDocument();
});
