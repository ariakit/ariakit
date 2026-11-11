import { click, press, q } from "@ariakit/test";
import { expect, test } from "vitest";

test("copies the code", async () => {
  await click(q.button("Copy code"));
  expect(await q.button.wait("Copied")).toBeInTheDocument();
  const copied = await navigator.clipboard.readText();
  expect(copied).toMatch(/^import \{ useState \} from "react";\n\n/);
  expect(copied).toMatch(/Clicked \{count\} times\n {4}<\/button>/);
});

test("names the scroll area with its label", () => {
  expect(q.region("Counter component")).toHaveAttribute("tabindex", "0");
});

test("the copy button follows the code in the tab order", async () => {
  await press.Tab();
  expect(q.region("Counter component")).toHaveFocus();
  await press.Tab();
  expect(q.button("Copy code")).toHaveFocus();
});
