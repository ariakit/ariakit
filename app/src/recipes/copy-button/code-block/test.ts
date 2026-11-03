import { click, q } from "@ariakit/test";
import { expect, test } from "vitest";

test("copies the source", async () => {
  await click(q.button("Copy commands"));
  expect(await q.button.wait("Copied")).toBeInTheDocument();
  expect(await navigator.clipboard.readText()).toBe(
    "pnpm add @ariakit/react\npnpm dev",
  );
});
