import * as ak from "@ariakit/react";
import { q, render } from "@ariakit/test/react";
import { expect, test } from "vitest";
import { Popover } from "./popover.react.tsx";

// Regression coverage: an explicitly-undefined variant prop (a conditional
// spread like $state={cond ? "none" : undefined}) once clobbered the
// injected "data" default, silently reverting to the native-open channel
// that never matches the rendered div.
test("keeps the injected $state default when the prop is explicitly undefined", async () => {
  await render(
    <ak.PopoverProvider defaultOpen>
      <Popover $state={undefined}>content</Popover>
    </ak.PopoverProvider>,
  );
  expect(q.dialog()).toHaveClass("data-open:starting:scale-95");
});
