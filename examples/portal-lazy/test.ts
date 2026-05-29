import { q } from "@ariakit/test";
import { expect, test } from "vitest";

test("loading button", async () => {
  expect(await q.button.wait("Button")).toBeInTheDocument();
});
