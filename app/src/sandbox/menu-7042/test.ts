import { click, dispatch, focus, press, q } from "@ariakit/test";
import { expect, test } from "vitest";

async function prepare(label: string) {
  await click(q.button(`Show ${label}`));
  const menu = q.menu(label);
  const withinMenu = q.within(menu);
  await focus(withinMenu.menuitem("New"));
  await press.End();
  expect(withinMenu.menuitem("Rename")).toHaveFocus();
  return { menu, withinMenu };
}

// https://github.com/ariakit/ariakit/issues/7042
test("restores focus after a focused item is replaced", async () => {
  const { withinMenu } = await prepare("Replaced actions");

  await dispatch.click(q.button("Replace Replaced actions items"));
  const replacement = withinMenu.menuitem("Rename");
  expect(replacement).toHaveAttribute("data-active-item");
  expect(document.activeElement).toBe(document.body);

  await dispatch.click(q.button("Finish Replaced actions positioning"));
  expect(replacement).toHaveFocus();
});
