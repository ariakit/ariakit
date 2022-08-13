import { render } from "ariakit-test";
import { axe } from "jest-axe";
import Example from ".";

test("ally", async () => {
  const { container } = render(<Example />);
  expect(await axe(container)).toHaveNoViolations();
});
