import { getByRole, getByText, render } from "@ariakit/test";
import Example from ".";

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
