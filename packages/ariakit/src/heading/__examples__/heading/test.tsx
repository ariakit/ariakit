import { getByRole, render } from "ariakit-test-utils";
import Example from ".";

test("render heading", () => {
  render(<Example />);
  expect(getByRole('heading')).toHaveTextContent('Heading 1')
});