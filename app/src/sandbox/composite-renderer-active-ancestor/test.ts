import { q } from "@ariakit/test";
import { expect, test } from "vitest";

const cases = [
  {
    label: "generated",
    name: "generated descendant without nested metadata",
  },
  {
    label: "partial-nested",
    name: "generated descendant with partial nested metadata",
  },
  {
    label: "explicit-nested",
    name: "explicit nested item id",
  },
  {
    label: "exact-over-prefix",
    name: "exact item after matching ancestor prefix",
  },
  {
    label: "longest-prefix",
    name: "closest ancestor after shallower prefix",
  },
] as const;

function getRenderedIndices(label: string) {
  const region = q.region(label);
  const items = q.within(region).button.all();
  return items.map((element) => element.getAttribute("data-index"));
}

test.each(cases)("renders active item ancestor for $name", ({ label }) => {
  expect(getRenderedIndices(label)).toEqual(["0", "1", "2"]);
});
