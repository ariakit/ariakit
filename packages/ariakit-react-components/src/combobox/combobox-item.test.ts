import { expect, test } from "vitest";
import { getItemRole } from "./combobox-item.tsx";

test("getItemRole", () => {
  expect(getItemRole()).toBe("option");
  expect(getItemRole("listbox")).toBe("option");
  expect(getItemRole("menu")).toBe("menuitem");
  expect(getItemRole("tree")).toBe("treeitem");
  expect(getItemRole("grid")).toBe("option");
  expect(getItemRole("constructor")).toBe("option");
  expect(getItemRole("toString")).toBe("option");
});
