import { q } from "@ariakit/test";

test("render correctly", async () => {
  expect(q.text(/I am portal/)).toBeInTheDocument();
});
