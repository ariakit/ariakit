import { q } from "@ariakit/test";
import { expect, test } from "vitest";

test("contributes to the button name while remaining visually hidden", () => {
  expect(q.button("Undo")).toBeInTheDocument();
  expect(q.text("Undo")).toHaveAttribute(
    "style",
    "border-width: 0px; clip-path: inset(50%); height: 1px; margin: -1px; overflow: hidden; padding: 0px; position: absolute; white-space: nowrap; width: 1px;",
  );
});
