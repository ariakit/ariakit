import { q } from "@ariakit/test";

test("markup", () => {
  expect(q.button()).toMatchInlineSnapshot(`
    <button
      class="button"
      type="button"
    >
      Button
    </button>
  `);
});
