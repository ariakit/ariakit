import { q } from "@ariakit/test";
import { expect, test } from "vitest";

test("render correctly", async () => {
  expect(q.text(/I am portal/)).toBeInTheDocument();
});
