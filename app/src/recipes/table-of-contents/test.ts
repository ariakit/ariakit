import { q } from "@ariakit/test";
import { expect, test } from "vitest";

test("names the landmark with the visible label", () => {
  const nav = q.navigation("On this page");
  expect(nav.tagName).toBe("NAV");
  expect(q.within(nav).text("On this page")).toBeVisible();
});

test("names the links by their labels only", () => {
  const nav = q.within(q.navigation("On this page"));
  expect(nav.link.all().map((link) => link.textContent)).toEqual([
    "Overview",
    "Installation",
    "Usage",
    "Basic example",
    "Controlled state",
    "Styling",
  ]);
  expect(nav.link("Basic example")).toHaveAccessibleName("Basic example");
});

test("renders a list item for each link outside an item", () => {
  const nav = q.within(q.navigation("On this page"));
  const [root, nested] = nav.list.all();
  const rootItems = root?.querySelectorAll(":scope > li");
  expect(rootItems).toHaveLength(4);
  expect(nav.link("Overview").parentElement).toBe(rootItems?.[0]);
  // The link in an item renders without its own list item, and the item holds
  // the nested list.
  const usageItem = nav.link("Usage").parentElement;
  expect(usageItem).toBe(rootItems?.[2]);
  expect(nested?.parentElement).toBe(usageItem);
  const nestedLinks = q.within(nested).link.all();
  expect(nestedLinks.map((link) => link.parentElement?.tagName)).toEqual([
    "LI",
    "LI",
  ]);
});

test("adds no tabindex to the headings", () => {
  for (const heading of q.heading.all()) {
    expect(heading).not.toHaveAttribute("tabindex");
  }
});
