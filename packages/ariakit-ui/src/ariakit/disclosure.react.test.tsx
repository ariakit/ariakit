import { q, render } from "@ariakit/test/react";
import { expect, test } from "vitest";
import { Disclosure, DisclosureButton } from "./disclosure.react.tsx";

// Regression coverage: a truthiness check once dropped falsy labels like
// {0}, leaving the aria-labelledby reference dangling.
test("renders falsy labels so the accessible name survives", async () => {
  await render(
    <Disclosure
      button={<DisclosureButton description="Details">{0}</DisclosureButton>}
    >
      content
    </Disclosure>,
  );
  expect(q.button()).toHaveAccessibleName("0");
});

// The decoration exists for absolutely positioned elements that must span the
// whole disclosure, so it has to be the root's own child, alongside the
// button and the content rather than inside either of them.
test("renders the decoration as the root's last child", async () => {
  await render(
    <Disclosure button="Open" decoration={<span data-testid="decoration" />}>
      content
    </Disclosure>,
  );
  const decoration = q.button("Open")?.parentElement?.lastElementChild;
  expect(decoration).toHaveAttribute("data-testid", "decoration");
});
