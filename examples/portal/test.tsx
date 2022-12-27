import { getByText, render } from "@ariakit/test";
import { axe } from "jest-axe";
import PortalExample from ".";

test("a11y", async () => {
  const { container } = render(<PortalExample />);
  expect(await axe(container)).toHaveNoViolations();
});

test("render correctly", async () => {
  render(<PortalExample />);
  expect(
    getByText("I am portal and I am detached at the bottom of the page.")
  ).toBeInTheDocument();
});
