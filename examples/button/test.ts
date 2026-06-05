import { expect, test, q } from "../../browser-test-utils.ts";

test("markup", () => {
  expect(q.button()).toMatchInlineSnapshot(`
    <button
      class="ak-button ak-button-default"
      type="button"
    >
      Button
    </button>
  `);
});
