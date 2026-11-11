import { click, q } from "@ariakit/test";
import { expect, test } from "vitest";

test("copies the code with a label that doesn't name the title", async () => {
  await click(q.button("Copy code"));
  expect(await q.button.wait("Copied")).toBeInTheDocument();
  expect(await navigator.clipboard.readText()).toBe(
    "export function Greeting({ name }) {\n  return <p>Hello, {name}!</p>;\n}",
  );
});
