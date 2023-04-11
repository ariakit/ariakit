import { getByRole, getByText } from "@ariakit/test";

test("render properly", () => {
  expect(getByRole("button", { name: "Undo" })).toBeInTheDocument();
  expect(getByText("Undo")).toMatchInlineSnapshot(`
    <span
      style="border: 0px; height: 1px; margin: -1px; overflow: hidden; padding: 0px; position: absolute; white-space: nowrap; width: 1px;"
    >
      Undo
    </span>
  `);
});
