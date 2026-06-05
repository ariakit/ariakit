import { expect, test, q } from "../../browser-test-utils.ts";

test("markup", () => {
  expect(q.group()).toMatchInlineSnapshot(`
    <div
      class="group"
      role="group"
    >
      <button
        class="button"
        type="button"
      >
        Bold
      </button>
      <button
        class="button"
        type="button"
      >
        Italic
      </button>
      <button
        class="button"
        type="button"
      >
        Underline
      </button>
    </div>
  `);
});
