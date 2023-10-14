import { q } from "@ariakit/test";

test("markup", () => {
  expect(q.link()).toMatchInlineSnapshot(`
    <a
      class="button"
      href="#"
    >
      Button
    </a>
  `);
});
