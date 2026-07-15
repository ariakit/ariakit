import { q } from "@ariakit/test";
import { expect, test } from "vitest";

// https://github.com/ariakit/ariakit/issues/6302
test("honors explicit toolbar separator orientation", () => {
  expect(q.separator("Column divider")).toHaveAttribute(
    "aria-orientation",
    "vertical",
  );

  expect(q.separator("Row divider")).toHaveAttribute(
    "aria-orientation",
    "horizontal",
  );

  expect(q.separator("Plain divider")).toHaveAttribute(
    "aria-orientation",
    "vertical",
  );
});
