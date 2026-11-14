import { q } from "@ariakit/test";
import { expect, test } from "vitest";

test("keeps the avatars out of the names of the controls", () => {
  expect(q.button("Acme")).toBeVisible();
  expect(q.button("Account")).toBeVisible();
  const nav = q.within(q.navigation("Direct messages"));
  expect(nav.link("Hana Kobayashi")).toHaveAccessibleDescription(
    "hana@example.com",
  );
  expect(nav.link("Tom Becker")).toBeVisible();
  expect(nav.text("HK")).toHaveAttribute("aria-hidden", "true");
});
