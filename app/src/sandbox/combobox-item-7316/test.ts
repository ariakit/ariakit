import { q } from "@ariakit/test";
import { expect, test } from "vitest";

// Reproduces https://github.com/ariakit/ariakit/issues/7316
test("uses the explicit store role under another popup", () => {
  const listbox = q.listbox("Inner list");
  expect(q.within(listbox).option("Inner item")).toBeInTheDocument();
});

// Reproduces https://github.com/ariakit/ariakit/issues/7316
test("uses the explicit store role without a provider", () => {
  const menu = q.menu("Standalone menu");
  expect(q.within(menu).menuitem("Standalone item")).toBeInTheDocument();
});
