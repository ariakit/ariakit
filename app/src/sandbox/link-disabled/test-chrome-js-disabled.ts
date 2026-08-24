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

withFramework(import.meta.dirname, async ({ test }) => {
  test.use({ javaScriptEnabled: false });

  // https://github.com/ariakit/ariakit/issues/7112
  test("serves complete disabled semantics before hydration", async ({
    page,
    q,
  }) => {
    const skipped = q.link("Previous page");
    for (const attribute of destinationAttributes) {
      await test.expect(skipped).not.toHaveAttribute(attribute);
    }
    await test.expect(skipped).toHaveAttribute("role", "link");
    await test.expect(skipped).toHaveAttribute("aria-disabled", "true");
    await test.expect(skipped).toHaveAttribute("tabindex", "-1");

    const probe = q.link("Raw destination attribute probe");
    for (const attribute of destinationAttributes) {
      await test.expect(probe).not.toHaveAttribute(attribute);
    }
    await test.expect(probe).toHaveAttribute("role", "link");
    await test.expect(probe).toHaveAttribute("aria-disabled", "true");

    const reachable = q.link("Reachable disabled link");
    await test.expect(reachable).not.toHaveAttribute("href");
    await test.expect(reachable).toHaveAttribute("role", "link");
    await test.expect(reachable).toHaveAttribute("aria-disabled", "true");
    await test.expect(reachable).toHaveAttribute("tabindex", "0");

    const functionRendered = q.link("Function-rendered disabled");
    for (const attribute of destinationAttributes) {
      await test.expect(functionRendered).not.toHaveAttribute(attribute);
    }
    await test
      .expect(functionRendered)
      .toHaveAttribute("data-function-render-disabled");
    await test.expect(functionRendered).toHaveAttribute("role", "link");
    await test
      .expect(functionRendered)
      .toHaveAttribute("aria-disabled", "true");
    await test.expect(functionRendered).toHaveAttribute("tabindex", "0");
    await test.expect(functionRendered).not.toHaveAttribute("disabled");

    await q.button("Before links").focus();
    await page.keyboard.press("Tab");
    await test.expect(reachable).toBeFocused();

    await page.keyboard.press("Tab");
    await test.expect(q.button("After links")).toBeFocused();
  });
});
