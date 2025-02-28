import { q } from "@ariakit/test";

test("render horizontal separator", () => {
  expect(q.separator()).toMatchInlineSnapshot(`
    <hr
      aria-orientation="horizontal"
      class="separator"
      role="separator"
    />
  `);
});
