import { q } from "@ariakit/test";

test("markup", () => {
  expect(q.button()).toMatchInlineSnapshot(`
    <button
      class="ak-focusable ak-clickable ak-button ak-button-default"
      type="button"
    >
      Button
    </button>
  `);
});
