import { hover, render, screen, waitFor } from "ariakit-test-utils";
import { axe } from "jest-axe";

import Example from ".";

test("a11y", async () => {
  const { container } = render(<Example />);
  expect(await axe(container)).toHaveNoViolations();
});

test("show hovercar on hover after timeout", async () => {
  render(<Example />);
  const avatar = screen.getByRole("img", {
    name: /the a11y project/i,
  });
  expect(avatar).toBeVisible();
  expect(screen.getByRole("dialog", { hidden: true })).not.toBeVisible();
  await hover(avatar);

  await waitFor(() => expect(screen.getByRole("dialog")).toBeVisible(), {
    timeout: 2000,
  });
});
