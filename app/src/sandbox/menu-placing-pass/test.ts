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

// The initial focus that a popup took counts for one open. A popup that opens
// again waits for its new pass, and then takes its initial focus again.
// https://github.com/ariakit/ariakit/issues/7625
test("holds the initial focus of a popup that opens again until it is placed", async () => {
  const trigger = q.button("Actions");
  const finish = q.button("Finish Actions positioning");
  await click(trigger);
  const menu = q.menu("Actions");
  await click(finish);
  expect(menu).toHaveFocus();

  await press.Escape();
  expect(menu).not.toBeVisible();
  expect(trigger).toHaveFocus();

  // `click` settles the DOM before it resolves, so an initial focus that did
  // not wait for the new pass would already have moved.
  await click(trigger);
  expect(menu).toHaveAttribute("data-placing");
  expect(trigger).toHaveFocus();

  await click(finish);
  expect(menu).not.toHaveAttribute("data-placing");
  expect(menu).toHaveFocus();
});

// Moving an open popup into a portal replaces its elements. The new element
// starts at its origin and has not taken the initial focus, so the popup takes
// it again, and only once that element has been positioned.
// https://github.com/ariakit/ariakit/issues/7625
test("holds the initial focus of a popup whose element is replaced until it is placed", async () => {
  const finish = q.button("Finish Portal actions positioning");
  await click(q.button("Portal actions"));
  await click(finish);
  expect(q.menu("Portal actions")).toHaveFocus();

  // The move stands in for work the application does on its own, so it is
  // dispatched to. A click would put focus on the button, where it stays
  // whether or not the popup waits.
  await dispatch.click(q.button("Move Portal actions to a portal"));
  await expect
    .poll(() => q.menu.maybe("Portal actions"))
    .toHaveAttribute("data-placing");
  // A popup that waits has no positive state. Its initial focus would come from
  // an effect and a microtask, and `dispatch` flushes only microtasks, so cross
  // a macrotask.
  await sleep();
  const menu = q.menu("Portal actions");
  expect(menu).toHaveAttribute("data-placing");
  expect(menu).not.toHaveFocus();

  await dispatch.click(finish);
  await expect.poll(() => menu).toHaveFocus();
  expect(menu).not.toHaveAttribute("data-placing");
});

// A popup with a leave transition stays mounted while it leaves. When another
// button opens it again in that time, it is a new open at a new place, so the
// popup waits for the pass that moves it there.
// https://github.com/ariakit/ariakit/issues/7625
test("holds the initial focus of a popup that opens again while it is leaving until it is placed", async () => {
  const finish = q.button("Finish Row actions positioning");
  const secondButton = q.button("Second row actions");
  await focus(q.button("First row actions"));
  await press.Enter();
  const menu = q.menu("Row actions");
  const item = q.menuitem("Rename row");
  expect(menu).toHaveAttribute("data-placing");
  // The button stands in for work the application does on its own, so it is
  // dispatched to. A click outside the menu would close it.
  await dispatch.click(finish);
  await expect.poll(() => item).toHaveFocus();

  // Focus on the other button closes the menu, which starts to leave.
  await focus(secondButton);
  await expect.poll(() => menu).toHaveAttribute("data-leave");
  // `press` settles the DOM before it resolves, so an initial focus that did
  // not wait for the new pass would already have moved.
  await press.Enter();
  expect(menu).toHaveAttribute("data-placing");
  expect(secondButton).toHaveFocus();

  await dispatch.click(finish);
  await expect.poll(() => item).toHaveFocus();
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
