import { q } from "@ariakit/test";
import { expect, test } from "vitest";

test("names the group, its avatars, and the count", () => {
  const group = q.within(q.group("Project members"));
  expect(group.img.all()).toHaveLength(5);
  expect(group.img("Hana Kobayashi")).toHaveTextContent("HK");
  expect(group.img("3 more members")).toHaveTextContent("+3");
});
