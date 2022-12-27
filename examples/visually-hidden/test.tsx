import { getByRole, getByText, render } from "@ariakit/test";
import { axe } from "jest-axe";
import Example from ".";

test("a11y", async () => {
  const { container } = render(<Example />);
  expect(await axe(container)).toHaveNoViolations();
});

test("render properly", () => {
  render(<Example />);
  expect(getByRole("button", { name: "Undo" })).toBeInTheDocument();
  expect(getByText("Undo")).toMatchInlineSnapshot(`
    <span
      style="border: 0px; height: 1px; margin: -1px; overflow: hidden; padding: 0px; position: absolute; white-space: nowrap; width: 1px;"
    >
      Undo
    </span>
  `);
});
