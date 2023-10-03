import { q } from "@ariakit/test";

test("markup", () => {
  expect(q.button()).toMatchInlineSnapshot(`
    <div
      class="button"
      data-command=""
      role="button"
      tabindex="0"
    >
      Button
    </div>
  `);
});
