// See https://github.com/ariakit/ariakit/issues/3729
import { click, q } from "@ariakit/test";
import { expect, test } from "vitest";

test.each(["Disclosure first", "Anchor first"])(
  "keeps the explicit anchor when the %s disclosure is clicked",
  async (label) => {
    const anchor = q.status.ensure(`${label} current anchor`);
    expect(anchor).toHaveTextContent("explicit");

    await click(q.button(`Open ${label}`));

    expect(anchor).toHaveTextContent("explicit");
  },
);
