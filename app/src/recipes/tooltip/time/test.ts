import { hover, q } from "@ariakit/test";
import { expect, test } from "vitest";

test("shows the exact time of a relative time", async () => {
  const link = q.link("3 hours ago");
  expect(link).toHaveAccessibleDescription("October 25, 2026 at 12:10 PM");
  await hover(link);
  expect(await q.tooltip.wait("October 25, 2026 at 12:10 PM")).toBeVisible();
  expect(q.link("yesterday")).toBeInTheDocument();
  expect(q.link("7 days ago")).toBeInTheDocument();
});
