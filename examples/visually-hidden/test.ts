// @vitest-environment jsdom
// happy-dom's CSS parser drops `clip: rect(0 0 0 0)` (real browsers and jsdom
// keep it), changing the serialized style. Pinned to jsdom so the snapshot
// reflects the real clip-rect hiding technique.
import { q } from "@ariakit/test";
import { expect, test } from "vitest";

test("render properly", () => {
  expect(q.button("Undo")).toBeInTheDocument();
  expect(q.text("Undo")).toMatchInlineSnapshot(`
    <span
      style="border: 0px; clip: rect(0px); height: 1px; margin: -1px; overflow: hidden; padding: 0px; position: absolute; white-space: nowrap; width: 1px;"
    >
      Undo
    </span>
  `);
});
