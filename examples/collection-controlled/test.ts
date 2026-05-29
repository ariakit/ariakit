import { q } from "@ariakit/test";
import { expect, test } from "vitest";

test("render correctly", async () => {
  expect(await q.text.wait("Items count: 3")).toBeInTheDocument();
});
