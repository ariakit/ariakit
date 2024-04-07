import { q } from "@ariakit/test";

test("markup", () => {
  expect(q.button()).toMatchInlineSnapshot(`
    <button
      class="focusable clickable button button-default"
      type="button"
    >
      Button
    </button>
  `);
});
