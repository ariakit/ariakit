import { getByText, render } from "ariakit-test-utils";
import Example from ".";

test("render correctly", async () => {
  render(<Example />);
  expect(getByText(/apple/i)).toBeInTheDocument();
  expect(getByText(/grape/i)).toBeInTheDocument();
  expect(getByText(/orange/i)).toBeInTheDocument();
  expect(getByText(/strawberry/i)).toBeInTheDocument();
  expect(getByText(/watermelon/i)).toBeInTheDocument();
});
