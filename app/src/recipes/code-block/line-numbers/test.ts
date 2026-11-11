import { click, q } from "@ariakit/test";
import { expect, test } from "vitest";

test("copies the code without line numbers", async () => {
  await click(q.button("Copy use-debounced-value.ts"));
  expect(await q.button.wait("Copied")).toBeInTheDocument();
  const copied = await navigator.clipboard.readText();
  expect(copied).toMatch(/^import \{ useEffect, useState \} from "react";\n/);
  expect(copied).not.toMatch(/^\s*\d/m);
});
