import { q } from "@ariakit/test";
import { expect, test } from "vitest";

test("keeps the full title in the name of each link", () => {
  const pages = q.within(q.region("Pinned pages"));
  expect(
    pages.link("Pricing experiments for the self-serve plan"),
  ).toBeInTheDocument();
  expect(
    pages.link("Runbook for the reporting database migration"),
  ).toBeInTheDocument();
});
