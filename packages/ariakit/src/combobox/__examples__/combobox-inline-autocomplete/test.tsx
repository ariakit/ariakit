import { render } from "ariakit-test";
import { axe } from "jest-axe";
import Example from ".";

test("a11y", async () => {
  const { container } = render(<Example />);
  expect(await axe(container)).toHaveNoViolations();
});
