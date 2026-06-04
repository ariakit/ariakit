import { expect, test } from "vitest";
import { computeAccessibleName } from "./accessible-name.ts";
import { elementMatchesRole } from "./role.ts";

function el(tag: string, attributes: Record<string, string> = {}): Element {
  const node = document.createElement(tag);
  for (const [name, value] of Object.entries(attributes)) {
    node.setAttribute(name, value);
  }
  return node;
}

// These cover the query-only role resolutions where `aria-query` (which role
// *queries* follow) diverges from `dom-accessibility-api`'s role table (which
// the accessible name algorithm follows).

test("a sized <select> resolves to listbox for queries by attribute presence", () => {
  // aria-query keys off the `size` attribute's presence, not its value, so
  // `size="1"`/`size="0"` are listboxes (the `size > 1` property rule used for
  // the name algorithm would misclassify them as comboboxes).
  expect(elementMatchesRole(el("select", { size: "1" }), "listbox")).toBe(true);
  expect(elementMatchesRole(el("select", { size: "1" }), "combobox")).toBe(
    false,
  );
  expect(elementMatchesRole(el("select", { size: "0" }), "listbox")).toBe(true);
  expect(elementMatchesRole(el("select", { multiple: "" }), "listbox")).toBe(
    true,
  );
  expect(elementMatchesRole(el("select"), "combobox")).toBe(true);
});

test("an empty-alt <img> stays presentation for queries even with an aria-label", () => {
  const labelledEmptyAlt = el("img", { alt: "", "aria-label": "logo" });
  expect(elementMatchesRole(labelledEmptyAlt, "img")).toBe(false);
  expect(elementMatchesRole(labelledEmptyAlt, "presentation")).toBe(true);
  // A non-empty or absent alt is still an image.
  expect(elementMatchesRole(el("img", { alt: "logo" }), "img")).toBe(true);
  expect(elementMatchesRole(el("img"), "img")).toBe(true);
  // The query role is decoupled from the accessible name: the name algorithm
  // still treats the labelled empty-alt image as an image, so the label sticks.
  expect(computeAccessibleName(labelledEmptyAlt)).toBe("logo");
});

test("the <link> element is not a link for queries (only <a>/<area> are)", () => {
  // aria-query has no mapping for the `<link>` element, unlike
  // `dom-accessibility-api`, which lumps `<link href>` in with `<a>`/`<area>`.
  expect(elementMatchesRole(el("link", { href: "#" }), "link")).toBe(false);
  expect(elementMatchesRole(el("a", { href: "#" }), "link")).toBe(true);
  expect(elementMatchesRole(el("area", { href: "#" }), "link")).toBe(true);
});
