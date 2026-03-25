import { q } from "@ariakit/test";
import { expect, test } from "vitest";

test("render horizontal separator", () => {
  expect(q.separator()).toMatchInlineSnapshot(`
    <hr
      aria-orientation="horizontal"
      class="separator"
      role="separator"
    />
  `);
});
