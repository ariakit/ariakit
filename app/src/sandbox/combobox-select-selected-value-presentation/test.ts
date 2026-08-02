import { click, q, type } from "@ariakit/test";
import { expect, test } from "vitest";

// https://github.com/ariakit/ariakit/pull/6832
test("activates a far item reached through typeahead", async () => {
  const select = q.combobox("Selected fruit");
  await click(select);
  await type("ly");

  expect(q.option("Lychee")).toHaveAttribute("data-active-item");
  expect(select).toHaveFocus();
});

// https://github.com/ariakit/ariakit/issues/6986
// The test harness renders examples in StrictMode. React 18 replays passive
// effects without replaying callback refs, so this also pins the workaround's
// observer ownership for an already-mounted hidden Popover.
test("presents a mounted selected item after StrictMode replay", async () => {
  const select = q.combobox("Centered fruit");
  const listbox = q.listbox("Centered fruit", { hidden: true });
  const cherry = q.within(listbox).option("Cherry", { hidden: true });

  Object.defineProperty(listbox, "clientHeight", {
    configurable: true,
    value: 120,
  });
  listbox.getBoundingClientRect = () => ({
    bottom: 120,
    height: 120,
    left: 0,
    right: 200,
    top: 0,
    width: 200,
    x: 0,
    y: 0,
    toJSON: () => ({}),
  });
  cherry.getBoundingClientRect = () => ({
    bottom: 120,
    height: 20,
    left: 0,
    right: 200,
    top: 100,
    width: 200,
    x: 0,
    y: 100,
    toJSON: () => ({}),
  });

  await click(select);

  expect(listbox.scrollTop).toBe(50);
});
