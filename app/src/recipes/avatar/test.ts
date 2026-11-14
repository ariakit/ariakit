import { q } from "@ariakit/test";
import { expect, test } from "vitest";

test("hides the avatars and keeps the names", () => {
  const list = q.within(q.list("Team"));
  expect(list.listitem.all()).toHaveLength(3);
  expect(list.text("Hana Kobayashi")).toBeVisible();
  expect(list.text("HK")).toHaveAttribute("aria-hidden", "true");
  expect(list.img.all()).toHaveLength(0);
});
