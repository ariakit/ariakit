import { expect, test } from "vitest";
import { isCurrentPage } from "./is-current-page.ts";

test("never matches without a current URL", () => {
  expect(isCurrentPage(undefined, "/")).toBe(false);
  expect(isCurrentPage(undefined, "/docs")).toBe(false);
  expect(isCurrentPage("", "/")).toBe(false);
});

test("matches equal pathnames ignoring trailing slashes", () => {
  expect(isCurrentPage("/docs/", "/docs")).toBe(true);
  expect(isCurrentPage("/docs", "/docs/")).toBe(true);
  expect(isCurrentPage("/docs", "/docs/intro")).toBe(false);
});

test("never matches an absolute destination from a path-only current URL", () => {
  expect(isCurrentPage("/docs", "https://example.com/docs")).toBe(false);
});

test("matches absolute URLs on the same origin", () => {
  expect(
    isCurrentPage("https://ariakit.org/docs", "https://ariakit.org/docs"),
  ).toBe(true);
  expect(
    isCurrentPage("https://ariakit.org/docs", "https://example.com/docs"),
  ).toBe(false);
});

test("only requires hash and search matches the destination declares", () => {
  expect(isCurrentPage("/docs#usage", "/docs")).toBe(true);
  expect(isCurrentPage("/docs", "/docs#usage")).toBe(false);
  expect(isCurrentPage("/docs?tab=1", "/docs")).toBe(true);
  expect(isCurrentPage("/docs", "/docs?tab=1")).toBe(false);
  expect(isCurrentPage("/docs?a=1&b=2", "/docs?b=2&a=1")).toBe(true);
});
