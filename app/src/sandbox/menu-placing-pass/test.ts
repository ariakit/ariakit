import { click, dispatch, focus, press, q } from "@ariakit/test";
import { expect, test } from "vitest";

// https://github.com/ariakit/ariakit/issues/7042
test("restores focus after a focused item is replaced", async () => {
  await click(q.button("Show replacement actions"));
  const withinMenu = q.within(q.menu("Replacement actions"));
  await focus(withinMenu.menuitem("Action 1"));
  await press.End();
  expect(withinMenu.menuitem("Action 30")).toHaveFocus();

  await dispatch.click(q.button("Replace focused action"));
  const replacement = withinMenu.menuitem("Action 30");
  expect(replacement).toHaveAttribute("data-active-item");
  expect(document.activeElement).toBe(document.body);

  await dispatch.click(q.button("Finish replacement actions positioning"));
  expect(replacement).toHaveFocus();
});

// The sandbox's other scenario, re-anchoring an already open popup, is covered
// only by the browser test: an already open popup has no initial focus left to
// take, and the focus half of a presentation never waits on placement, so its
// only user-facing effect is a document scroll that happy-dom cannot model.
// https://github.com/ariakit/ariakit/issues/7019
test("keeps the popup unplaced while a custom updatePosition is still working", async () => {
  await click(q.button("Actions"));
  const menu = q.menu("Actions");
  // A popup that isn't placed doesn't take its initial focus, so focus staying
  // on the button is the user-facing half of the state the attribute mirrors.
  expect(q.button("Actions")).toHaveFocus();
  expect(menu).toHaveAttribute("data-placing");

  await click(q.button("Move to last Actions action"));
  expect(q.menuitem("Action 30")).toHaveAttribute("data-active-item");
  expect(menu).toHaveAttribute("data-placing");

  await click(q.button("Finish Actions positioning"));
  expect(menu).not.toHaveAttribute("data-placing");
});

// The same flow in happy-dom, which is where the React 18 suite runs. What it
// pins is a scheduling property rather than anything the browser decides: a
// popup that mounts once its store is already open, with no `Popover` mounted
// to publish the show transition, must not take focus before its own pass
// finishes.
// https://github.com/ariakit/ariakit/pull/7032#discussion_r3703769238
test("keeps focus out of a popup that mounts after its store is open", async () => {
  const trigger = q.button("Late actions");
  await click(trigger);
  const menu = q.menu("Late actions");
  expect(menu).toHaveAttribute("data-placing");
  expect(trigger).toHaveFocus();

  await click(q.button("Finish Late actions positioning"));
  expect(menu).not.toHaveAttribute("data-placing");
  expect(menu).toHaveFocus();
});
