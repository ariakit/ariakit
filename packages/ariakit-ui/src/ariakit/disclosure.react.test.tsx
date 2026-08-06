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
