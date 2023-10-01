import { q } from "@ariakit/test";

test("markup", () => {
  expect(q.button()).toMatchInlineSnapshot(`
    <button
      class="button"
      data-command=""
      type="button"
    >
      Button
    </button>
  `);
});
