import { expect, test, q } from "../../browser-test-utils.ts";

test("render correctly", async () => {
  expect(await q.text.wait("Items count: 3")).toBeInTheDocument();
});
