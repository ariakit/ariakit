import { q } from "@ariakit/test";
import { expect, test } from "vitest";

test("markup", () => {
  expect(q.button()).toMatchInlineSnapshot(`
    <div
      class="button"
      role="button"
      tabindex="0"
    >
      Button
    </div>
  `);
});
