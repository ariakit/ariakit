import { findByText } from "@ariakit/test";

test("render correctly", async () => {
  expect(await findByText("Items count: 3")).toBeInTheDocument();
});
