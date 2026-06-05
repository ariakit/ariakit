import { expect, test, q } from "../../browser-test-utils.ts";

test("render correctly", async () => {
  expect(q.text(/I am portal/)).toBeInTheDocument();
});
