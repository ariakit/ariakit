import { withFramework } from "#app/test-utils/preview.ts";

withFramework(import.meta.dirname, async ({ test, query }) => {
  // https://github.com/ariakit/ariakit/pull/5240#discussion_r3974552687
  test("omits a conditional navigation button without hiding its links", async ({
    q,
  }) => {
    const navigation = query(q.navigation("Workspace navigation"));
    await test.expect(navigation.link("Workspace members")).toBeVisible();
    await test.expect(navigation.link("Workspace settings")).toBeVisible();
    await test.expect(navigation.button()).toHaveCount(0);

    await q.checkbox("Show navigation headings").check();
    const button = navigation.button("Workspace pages");
    await test.expect(button).toBeVisible();
    await test.expect(navigation.button()).toHaveCount(1);
    await test.expect(button).toHaveAttribute("aria-expanded", "false");
    await test.expect(navigation.link("Workspace members")).toBeHidden();
    await button.click();
    await test.expect(navigation.link("Workspace members")).toBeVisible();
    await test.expect(navigation.link("Workspace settings")).toBeVisible();
    await button.click();
    await test.expect(navigation.link("Workspace members")).toBeHidden();

    await q.checkbox("Show navigation headings").uncheck();
    await test.expect(navigation.link("Workspace members")).toBeVisible();
    await test.expect(navigation.link("Workspace settings")).toBeVisible();
    await test.expect(navigation.button()).toHaveCount(0);
  });

  // https://github.com/ariakit/ariakit/pull/5240#discussion_r3974552687
  test("keeps zero as a navigation button label", async ({ q }) => {
    const navigation = query(q.navigation("Invitation navigation"));
    const button = navigation.button("0");
    await test.expect(button).toBeVisible();
    await test.expect(button).toHaveAttribute("aria-expanded", "false");
    await test.expect(navigation.link("Invitation settings")).toBeHidden();
    await button.click();
    await test.expect(button).toHaveAttribute("aria-expanded", "true");
    await test.expect(navigation.link("Invitation settings")).toBeVisible();
  });

  // https://github.com/ariakit/ariakit/pull/5240#discussion_r3973584695
  test("uses the explicit navigation button and content without extra controls", async ({
    q,
  }) => {
    const navigation = query(q.navigation("Project navigation"));
    const button = navigation.button("Project pages");
    await test.expect(button).toBeVisible();
    await test.expect(navigation.button()).toHaveCount(1);
    await test.expect(button).toHaveAttribute("aria-expanded", "false");
    await test.expect(navigation.link("All projects")).toBeHidden();

    await button.click();
    await test.expect(button).toHaveAttribute("aria-expanded", "true");
    await test.expect(navigation.link("All projects")).toBeVisible();
    await test.expect(navigation.button()).toHaveCount(1);

    await button.click();
    await test.expect(navigation.link("All projects")).toBeHidden();
    await test.expect(button).toBeVisible();
  });

  // https://github.com/ariakit/ariakit/pull/5240#discussion_r3972223511
  test("keeps a dialog closed when its navigation contains the current page", async ({
    q,
  }) => {
    const disclosure = q.button("Open navigation dialog");
    await test.expect(disclosure).toHaveAttribute("aria-expanded", "false");
    await test.expect(q.dialog("Navigation dialog")).toBeHidden();

    await disclosure.click();
    await test.expect(q.dialog("Navigation dialog")).toBeVisible();
    await test
      .expect(q.link("Documentation"))
      .toHaveAttribute("aria-current", "page");

    await q.button("Close navigation dialog").click();
    await test.expect(q.dialog("Navigation dialog")).toBeHidden();
  });

  // https://github.com/ariakit/ariakit/pull/5240#discussion_r3972223511
  test("opens the current page's navigation group across an unrelated provider", async ({
    q,
  }) => {
    await test
      .expect(q.button("Account pages"))
      .toHaveAttribute("aria-expanded", "true");
    await test.expect(q.link("Account overview")).toBeVisible();
    await test
      .expect(q.button("Open account settings"))
      .toHaveAttribute("aria-expanded", "false");
    await test.expect(q.dialog("Account settings")).toBeHidden();

    await q.button("Open account settings").click();
    await test.expect(q.dialog("Account settings")).toBeVisible();
  });
});
