import { click, getByRole, press, render } from "ariakit-test-utils";
import { axe } from "jest-axe";
import Example from ".";

const getMenuButton = (name: string) => getByRole("button", { name });
const getMenuItem = (name: string) => getByRole("menuitemcheckbox", { name });

test("a11y", () => {
  // const { container } = render(<Example />);
  // await click(getMenuButton("Unwatch"));
  // expect(await axe(container)).toHaveNoViolations();
});
