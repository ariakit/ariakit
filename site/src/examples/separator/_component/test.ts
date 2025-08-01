import { q } from "@ariakit/test";

test("render horizontal separator", () => {
  expect(q.separator()).toMatchInlineSnapshot(`
    <hr
      aria-orientation="horizontal"
      class="ak-layer-current"
      role="separator"
    />
  `);
});
