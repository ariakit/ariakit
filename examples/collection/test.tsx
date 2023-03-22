import { findByText, render } from "@ariakit/test";
import Example from "./index.js";

test("render correctly", async () => {
  render(<Example />);
  expect(await findByText("Items count: 3")).toBeInTheDocument();
});
