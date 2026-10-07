import { blur, click, dispatch, focus, press, q, sleep } from "@ariakit/test";
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
  expect(replacement).toHaveFocus();

  await dispatch.click(q.button("Finish replacement actions positioning"));
  expect(replacement).toHaveFocus();
});

// https://github.com/ariakit/ariakit/issues/7042
test("leaves focus outside after a focused item is replaced", async () => {
  await click(q.button("Show replacement actions"));
  const withinMenu = q.within(q.menu("Replacement actions"));
  await focus(withinMenu.menuitem("Action 1"));
  await press.End();
  const item = withinMenu.menuitem("Action 30");
  expect(item).toHaveFocus();

  await blur(item);
  expect(document.activeElement).toBe(document.body);
  await dispatch.click(q.button("Replace focused action"));
  const replacement = withinMenu.menuitem("Action 30");
  expect(replacement).toHaveAttribute("data-active-item");

  await dispatch.click(q.button("Finish replacement actions positioning"));
  expect(replacement).not.toHaveFocus();
});

// https://github.com/ariakit/ariakit/pull/7065#discussion_r3711847856
test("restores focus when a refocused item is replaced", async () => {
  await click(q.button("Show replacement actions"));
  const menu = q.menu("Replacement actions");
  const withinMenu = q.within(menu);
  await focus(withinMenu.menuitem("Action 1"));
  await press.End();
  const item = withinMenu.menuitem("Action 30");
  expect(item).toHaveFocus();
  expect(menu).toHaveAttribute("data-placing");
  await blur(item);
  expect(document.activeElement).toBe(document.body);
  await focus(item);
  expect(item).toHaveFocus();

  await dispatch.click(q.button("Replace focused action"));
  const replacement = withinMenu.menuitem("Action 30");

  await dispatch.click(q.button("Finish replacement actions positioning"));
  expect(replacement).toHaveFocus();
});

// The scroll half of re-anchoring an already open popup is covered only by the
// browser test: the focus half of a presentation never waits on placement, so
// what the pass holds back is a document scroll that happy-dom cannot model.
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

// A popup takes its initial focus once each time it opens. A pass that runs
// later, while the popup is open, has no initial focus left to give, so it must
// leave focus on the item the user moved to.
// https://github.com/ariakit/ariakit/issues/7625
test("keeps focus on a moved item after an open popup repositions itself", async () => {
  await focus(q.button("Actions"));
  await press.Enter();
  const menu = q.menu("Actions");
  const finish = q.button("Finish Actions positioning");
  const item = q.menuitem("Action 3");
  expect(menu).toHaveAttribute("data-placing");
  // The buttons that drive a pass stand in for work the application does on its
  // own, so they are dispatched to. A click would move focus out of the menu,
  // and the popup never takes focus back from outside.
  await dispatch.click(finish);
  await expect.poll(() => q.menuitem("Action 1")).toHaveFocus();

  await press.ArrowDown();
  await press.ArrowDown();
  expect(item).toHaveFocus();

  await dispatch.click(q.button("Reposition Actions"));
  expect(menu).toHaveAttribute("data-placing");
  await dispatch.click(finish);
  await expect.poll(() => menu).not.toHaveAttribute("data-placing");
  // Focus that stays put has no positive state. The popup would take its
  // initial focus from an effect and a microtask that follow the commit the
  // attribute above reports, and `dispatch` flushes only microtasks, so cross a
  // macrotask.
  await sleep();
  expect(item).toHaveFocus();
  expect(item).toHaveAttribute("data-active-item");
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
