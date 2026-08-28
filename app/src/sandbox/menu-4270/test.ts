import { click, q } from "@ariakit/test";
import { expect, test } from "vitest";

// https://github.com/ariakit/ariakit/issues/4270
test("modal menu exposes only its items to assistive technology", async () => {
  await click(q.button("Preview"));
  const menu = q.menu();
  expect(menu).toBeVisible();
  expect(q.within(menu).menuitem.all()).toHaveLength(3);
  expect(q.within(menu).button.all()).toHaveLength(0);
});

// https://github.com/ariakit/ariakit/issues/4270
test("modal menu keeps its menu button exposed to assistive technology", async () => {
  await click(q.button("Preview"));
  expect(q.menu()).toBeVisible();
  // The menu is named after the menu button through `aria-labelledby`, so the
  // button has to stay outside the `inert` subtree for that name to resolve.
  expect(q.button.maybe("Preview")).toBeInTheDocument();
  // Only the menu button joins the modal context. The rest stays inert.
  expect(q.button.maybe("Publish")).not.toBeInTheDocument();
});

// https://github.com/ariakit/ariakit/issues/4270
test("modal menu can be closed through its menu button", async () => {
  await click(q.button("Preview"));
  expect(q.menu()).toBeVisible();
  // Touch based assistive technology can't press Escape or click outside, so
  // the menu button is the route out of the menu. Query it again instead of
  // reusing the element above, so that the query rejects it while it's inert.
  // Activating it dispatches on the element like assistive technology does,
  // without the pointer hit testing that a real browser backdrop absorbs.
  const menuButton = q.button.maybe("Preview");
  expect(menuButton).toBeInTheDocument();
  await click(menuButton);
  expect(q.menu.maybe()).not.toBeInTheDocument();
});
