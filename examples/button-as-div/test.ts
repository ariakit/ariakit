import { expect, test, q } from "../../browser-test-utils.ts";

test("markup", () => {
  expect(q.button()).toMatchInlineSnapshot(`
    <div
      class="button"
      role="button"
      tabindex="0"
    >
      Button
    </div>
  `);
});
