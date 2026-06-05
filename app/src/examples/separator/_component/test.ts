import { expect, test, q } from "../../../../../browser-test-utils.ts";

test("render horizontal separator", () => {
  expect(q.separator()).toMatchInlineSnapshot(`
    <hr
      aria-orientation="horizontal"
      class="ak-layer"
      role="separator"
    />
  `);
});
