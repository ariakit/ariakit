import { q } from "@ariakit/test";

test("render correctly", async () => {
  expect(await q.text.wait("Items count: 3")).toBeInTheDocument();
});
