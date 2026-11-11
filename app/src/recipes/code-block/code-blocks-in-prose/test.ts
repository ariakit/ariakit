import { click, q } from "@ariakit/test";
import { expect, test } from "vitest";

test("applies a package manager to every install block", async () => {
  const [first] = q.tab.all("pnpm");
  if (!first) throw new Error("Missing pnpm tab");
  await click(first);
  for (const tab of q.tab.all("pnpm")) {
    expect(tab).toHaveAttribute("aria-selected", "true");
  }
  const panels = q.tabpanel.all();
  expect(panels.map((panel) => panel.textContent)).toEqual([
    "pnpm add react react-dom",
    "pnpm add @ariakit/react",
  ]);
  // Each copy button names its command, as the page has two of them.
  expect(q.button("Copy pnpm add react react-dom")).toBeInTheDocument();
  expect(q.button("Copy pnpm add @ariakit/react")).toBeInTheDocument();
});

test("names the copy buttons of the files with their titles", () => {
  expect(q.button("Copy details.tsx")).toBeInTheDocument();
  expect(q.button("Copy disclosure.css")).toBeInTheDocument();
});
