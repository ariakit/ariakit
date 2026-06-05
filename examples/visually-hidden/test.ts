import { expect, test, q } from "../../browser-test-utils.ts";

test("render properly", () => {
  expect(q.button("Undo")).toBeInTheDocument();
  expect(q.text("Undo")).toMatchInlineSnapshot(`
    <span
      style="border: 0px; clip: rect(0px, 0px, 0px, 0px); height: 1px; margin: -1px; overflow: hidden; padding: 0px; position: absolute; white-space: nowrap; width: 1px;"
    >
      Undo
    </span>
  `);
});
