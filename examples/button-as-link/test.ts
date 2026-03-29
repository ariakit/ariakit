import { q } from "@ariakit/test";
import { expect, test } from "vitest";

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
