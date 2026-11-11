import { click, q } from "@ariakit/test";
import { expect, test } from "vitest";

test("copies the command without the prompt sign", async () => {
  await click(q.button("Copy command"));
  expect(await q.button.wait("Copied")).toBeInTheDocument();
  expect(await navigator.clipboard.readText()).toBe(
    "npm install @ariakit/react",
  );
});
