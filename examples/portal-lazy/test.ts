import { expect, test, q } from "../../browser-test-utils.ts";

test("loading button", async () => {
  expect(await q.button.wait("Button")).toBeInTheDocument();
});
