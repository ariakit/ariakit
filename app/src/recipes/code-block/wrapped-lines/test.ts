import { click, q } from "@ariakit/test";
import { expect, test } from "vitest";

test("wrapped code is not a tab stop", () => {
  expect(q.region.maybe("package.json")).not.toBeInTheDocument();
  expect(document.querySelector("pre")).not.toHaveAttribute("tabindex");
});

test("copies the file without line numbers", async () => {
  await click(q.button("Copy package.json"));
  expect(await q.button.wait("Copied")).toBeInTheDocument();
  const copied = await navigator.clipboard.readText();
  expect(copied).toMatch(/^\{\n {2}"name": "pricing-page",/);
  expect(copied.split("\n")).toHaveLength(17);
});
