import { click, q } from "@ariakit/test";
import { version } from "react";
import { expect, test } from "vitest";

// This gallery uses React 19 ref props, as declared by @ariakit/ui.
// https://github.com/ariakit/ariakit/pull/7489#discussion_r3995226174
test.skipIf(version.startsWith("18."))(
  "preserves the selected avatar color when its kind changes",
  async () => {
    const picture = q.button("Change avatar color");
    const image = () => q.button("Change avatar color").querySelector("img");
    expect(image()).toHaveAttribute("src", expect.stringContaining("f59e0b"));
    await click(picture);
    expect(image()).toHaveAttribute("src", expect.stringContaining("6366f1"));
    const round = q.button("Round avatar");
    await click(round);
    expect(round).toHaveAttribute("aria-pressed", "false");
    expect(image()).toHaveAttribute("src", expect.stringContaining("6366f1"));
    await click(round);
    expect(round).toHaveAttribute("aria-pressed", "true");
    expect(image()).toHaveAttribute("src", expect.stringContaining("6366f1"));
  },
);
