import { click, q } from "@ariakit/test";
import { expect, test } from "vitest";

test("copies the code without the line numbers and the marks", async () => {
  await click(q.button("Copy fetch-users.ts"));
  expect(await q.button.wait("Copied")).toBeInTheDocument();
  const copied = await navigator.clipboard.readText();
  expect(copied).toMatch(/^import type \{ User \} from "\.\/types\.ts";\n\n/);
  expect(copied).toContain('limit: "20" });\n');
});
