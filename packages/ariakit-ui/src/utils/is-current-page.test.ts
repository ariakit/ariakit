import { expect, test } from "vitest";
import { isCurrentPage } from "./is-current-page.ts";

test.each([
  // Trailing slashes are ignored on both sides.
  ["/docs/button/", "/docs/button", true],
  ["/docs/button", "/docs/button/", true],
  ["/docs/button", "/docs/tabs", false],
  ["/", "/", true],
  // A hash on the destination must match. A hash on the current URL alone is
  // ignored, and a bare "#" points to the current page.
  ["/docs/button", "/docs/button#nav", false],
  ["/docs/button#nav", "/docs/button#nav", true],
  ["/docs/button#a", "/docs/button#b", false],
  ["/docs/button#nav", "/docs/button", true],
  ["/x#top", "#top", true],
  ["/x", "#", true],
  ["/x#top", "#other", false],
  // Search parameters compare in any order. A destination without them
  // matches a current URL with them, but not the other way around.
  ["/docs?a=1&b=2", "/docs?b=2&a=1", true],
  ["/docs?a=1", "/docs", true],
  ["/docs", "/docs?a=1", false],
  ["/docs?a=1", "/docs?a=2", false],
  // Relative destinations resolve against the current URL.
  ["/docs/", "button", false],
  ["/docs/", "/docs/button", false],
  ["/docs/button", "button", true],
  // Only destinations on the current origin can match.
  ["/docs/button", "https://other.org/docs/button", false],
  ["https://ariakit.org/docs", "https://ariakit.org/docs/", true],
  ["https://ariakit.org/docs", "https://other.org/docs", false],
  ["https://ariakit.org/docs", "/docs", true],
])("isCurrentPage(%j, %j) is %s", (currentUrl, href, expected) => {
  expect(isCurrentPage(currentUrl, href)).toBe(expected);
});

test("accepts URL objects", () => {
  const currentUrl = new URL("https://ariakit.org/docs/button/");
  expect(
    isCurrentPage(currentUrl, new URL("https://ariakit.org/docs/button")),
  ).toBe(true);
  expect(isCurrentPage(currentUrl, "/docs/tabs")).toBe(false);
});

test("never matches without both URLs or with a destination that is not a URL", () => {
  expect(isCurrentPage(undefined, "/docs")).toBe(false);
  expect(isCurrentPage("/docs", undefined)).toBe(false);
  expect(isCurrentPage("", "/docs")).toBe(false);
  expect(isCurrentPage("/docs", "")).toBe(false);
  expect(isCurrentPage("/docs", "javascript:void(0)")).toBe(false);
  expect(isCurrentPage("/docs", "http://[invalid")).toBe(false);
});
