import { withFramework } from "#app/test-utils/preview.ts";

// The underline is a plain text-decoration rule, so Chrome is enough.
withFramework(
  import.meta.dirname,
  { route: "link" },
  async ({ query, test }) => {
    const links = [
      { box: "Default", name: "styling guide", role: "link" },
      {
        box: "Wrapped across lines",
        name: /^A link long enough/,
        role: "link",
      },
      { box: "Rendered as a button", name: "Copy link", role: "button" },
    ] as const;

    for (const { box, name, role } of links) {
      test(`thickens the underline on hover in ${box}`, async ({ q }) => {
        const scope = query(q.article(box));
        const link = role === "link" ? scope.link(name) : scope.button(name);
        await test.expect(link).toHaveCSS("text-decoration-thickness", "1px");
        await link.hover();
        await test.expect(link).toHaveCSS("text-decoration-thickness", "3px");
      });
    }
  },
);
