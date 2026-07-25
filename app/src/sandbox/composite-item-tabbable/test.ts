import { q } from "@ariakit/test";
import { expect, test } from "vitest";

function tabIndexes(label: string) {
  const composite = document.querySelector(`[aria-label="${label}"]`);
  return [...(composite?.querySelectorAll("button") ?? [])].map((item) =>
    item.getAttribute("tabindex"),
  );
}

// The composite element is published one commit after the items mount, so
// gating only on it would drop roving tabindex for composite stores that never
// get a composite element.
// https://github.com/ariakit/ariakit/pull/6832
test("keeps roving tabindex without a composite element", () => {
  const radios = q.radio.all();
  expect(radios.map((radio) => radio.getAttribute("tabindex"))).toEqual([
    null,
    "-1",
  ]);
});

// https://github.com/ariakit/ariakit/pull/6832
test("keeps virtual focus items out of the tab order", () => {
  expect(tabIndexes("Virtual focus composite")).toEqual(["-1", "-1"]);
});
