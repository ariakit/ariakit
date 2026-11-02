import { q } from "@ariakit/test";
import { expect, test } from "vitest";

test("keeps the full text in the name of a clipped link", () => {
  const trail = q.within(q.navigation("Breadcrumb"));
  expect(trail.link("Regional operations and logistics")).toBeInTheDocument();
  expect(
    trail.link("Northern Europe distribution centers"),
  ).toBeInTheDocument();
});
