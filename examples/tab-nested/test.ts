import { click, press, q } from "@ariakit/test";

test("switch tabs", async () => {
  expect(q.tab("Documentation")).toHaveAttribute("aria-selected", "true");
  expect(q.tab("npm")).toHaveAttribute("aria-selected", "true");
  expect(q.tabpanel("npm")).toBeVisible();

  await click(q.tab("yarn"));
  expect(q.tab("yarn")).toHaveAttribute("aria-selected", "true");
  expect(q.tabpanel("yarn")).toBeVisible();

  await press.ArrowRight();
  expect(q.tab("pnpm")).toHaveAttribute("aria-selected", "true");
  expect(q.tabpanel("pnpm")).toBeVisible();

  await click(q.tab("Reference"));
  await press.ArrowLeft();
  expect(q.tabpanel("pnpm")).toBeVisible();
});
