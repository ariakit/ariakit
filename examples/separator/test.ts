import { q } from "@ariakit/test";

test.skipIf(process.env.ARIAKIT_BENCH === "1")(
  "render horizontal separator",
  () => {
    expect(q.separator()).toMatchInlineSnapshot(`
    <hr
      aria-orientation="horizontal"
      class="separator"
      role="separator"
    />
  `);
  },
);
