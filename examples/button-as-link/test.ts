import { q } from "@ariakit/test";

test("markup", () => {
  expect(q.link()).toMatchInlineSnapshot(`
    <a
      class="button"
      data-command=""
      href="#"
    >
      Button
    </a>
  `);
});
