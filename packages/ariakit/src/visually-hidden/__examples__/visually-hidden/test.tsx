import { getByText, render } from "ariakit-test";
import { axe } from "jest-axe";
import Example from ".";

test("ally", async () => {
  const { container } = render(<Example />);
  expect(await axe(container)).toHaveNoViolations();
});

test("render properly", () => {
  render(<Example />);

  expect(
    getByText("Inspect the DOM below me to see the hidden element")
  ).toBeVisible();

  const visuallyHidden = getByText("You should not see me");
  expect(visuallyHidden).toBeInTheDocument();
  expect(visuallyHidden).toMatchInlineSnapshot(`
    <span
      style="border: 0px; height: 1px; margin: -1px; overflow: hidden; padding: 0px; position: absolute; white-space: nowrap; width: 1px;"
    >
      You should not see me
    </span>
  `);
});
