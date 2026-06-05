import { expect, test, q } from "../../browser-test-utils.ts";

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
