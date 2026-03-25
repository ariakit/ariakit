import { q } from "@ariakit/test";
import { expect, test } from "vitest";

test("markup", () => {
  expect(q.button()).toMatchInlineSnapshot(`
    <button
      class="ak-button ak-button-default"
      type="button"
    >
      Button
    </button>
  `);
});
