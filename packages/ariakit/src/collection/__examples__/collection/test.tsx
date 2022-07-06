import { getByText, render } from "ariakit-test";
import Example from ".";

test("render correctly", async () => {
  render(<Example />);
  expect(getByText("Items count: 3")).toBeInTheDocument();
});
