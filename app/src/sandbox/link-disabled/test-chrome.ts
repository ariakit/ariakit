import { withFramework } from "#app/test-utils/preview.ts";

const destinationAttributes = [
  "href",
  "itemprop",
  "target",
  "download",
  "ping",
  "rel",
  "hreflang",
  "referrerpolicy",
  "type",
];

const restoredDestination = {
  href: "#destination-contract",
  itemprop: "url",
  target: "_blank",
  download: "contract.html",
  ping: "/analytics/link",
  rel: "next",
  hreflang: "en",
  referrerpolicy: "no-referrer",
  type: "text/html",
};

withFramework(import.meta.dirname, async ({ test }) => {
  test("renders native enabled and complete disabled contracts", async ({
    q,
  }) => {
    const enabled = q.link("Read field notes");
    await test.expect(enabled).toHaveAttribute("href", "#field-notes");
    await test.expect(enabled).not.toHaveAttribute("role");
    await test.expect(enabled).not.toHaveAttribute("aria-disabled");
    await test.expect(enabled).not.toHaveAttribute("tabindex");

    const disabled = q.link("Raw destination attribute probe");
    for (const attribute of destinationAttributes) {
      await test.expect(disabled).not.toHaveAttribute(attribute);
    }
    await test.expect(disabled).toHaveAttribute("role", "link");
    await test.expect(disabled).toHaveAttribute("aria-disabled", "true");
    await test.expect(disabled).toHaveAttribute("tabindex", "-1");

    const accessible = q.link("Disabled reachable");
    await test.expect(accessible).not.toHaveAttribute("href");
    await test.expect(accessible).toHaveAttribute("tabindex", "0");
    await test.expect(accessible).toHaveAttribute("aria-disabled", "true");
    await test.expect(accessible).toMatchAriaSnapshot(`
      - link "Disabled reachable" [disabled]
    `);
  });

  test("restores every destination attribute declaratively", async ({ q }) => {
    const probe = q.link("Raw destination attribute probe");
    await q.button("Restore destination attributes").click();
    for (const [attribute, value] of Object.entries(restoredDestination)) {
      await test.expect(probe).toHaveAttribute(attribute, value);
    }
  });

  test("keeps interactive pagination destinations realistic", async ({ q }) => {
    await q.link("Next page").click();
    await test.expect(q.text("Chapter 2 of 3")).toBeVisible();
    const previous = q.link("Previous page");
    await test.expect(previous).toHaveAttribute("href", "#chapter-1");
    await test.expect(previous).not.toHaveAttribute("target");
    await test.expect(previous).not.toHaveAttribute("download");
    await test.expect(previous).not.toHaveAttribute("ping");
  });

  test("preserves node identity and focus through both transitions", async ({
    q,
  }) => {
    const link = q.link("Release notes");
    const before = await link.elementHandle();
    if (!before) {
      throw new Error("Release notes link was not rendered");
    }

    await q.button("Disable while focused").click();
    let after = await q.link("Release notes").elementHandle();
    if (!after) {
      throw new Error("Release notes link was removed");
    }
    test
      .expect(
        await before.evaluate(
          (element, nextElement) => element === nextElement,
          after,
        ),
      )
      .toBe(true);
    await test.expect(q.link("Release notes")).toBeFocused();
    await test.expect(q.link("Release notes")).not.toHaveAttribute("href");

    await q.button("Enable while focused").click();
    after = await q.link("Release notes").elementHandle();
    if (!after) {
      throw new Error("Release notes link was removed after re-enabling");
    }
    test
      .expect(
        await before.evaluate(
          (element, nextElement) => element === nextElement,
          after,
        ),
      )
      .toBe(true);
    await test.expect(q.link("Release notes")).toBeFocused();
    await test
      .expect(q.link("Release notes"))
      .toHaveAttribute("href", "#release-notes");
  });

  test("preserves the outer menu item role and disabled state", async ({
    q,
  }) => {
    await q.button("Workspace menu").click();
    const item = q.menuitem("Enterprise settings");
    await test.expect(item).toHaveAttribute("role", "menuitem");
    await test.expect(item).toHaveAttribute("aria-disabled", "true");
    await test.expect(item).not.toHaveAttribute("href");
  });
});
