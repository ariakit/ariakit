import { click, q, type } from "@ariakit/test";
import { expect, test } from "vitest";

test("copies the text at the moment of the click", async () => {
  await click(q.textbox("Release note"));
  await type(" Added the copy button.");
  await click(q.button("Copy note"));
  expect(await q.status.wait("Copied")).toBeInTheDocument();
  expect(await navigator.clipboard.readText()).toBe(
    "Fixed the focus order of the settings dialog. Added the copy button.",
  );
});
