import { q } from "@ariakit/test";
import { expect, test } from "vitest";

// https://github.com/ariakit/ariakit/issues/6334
test("cells compute their position from row-level aria-posinset", async () => {
  expect(q.grid("Inbox")).toBeInTheDocument();

  for (const position of [21, 22, 23, 24]) {
    await expect
      .poll(q.gridcell.lazy(`Cell ${position}`))
      .toHaveAttribute("aria-posinset", `${position}`);
    expect(q.gridcell(`Cell ${position}`)).toHaveAttribute(
      "aria-setsize",
      "100",
    );
  }
});
