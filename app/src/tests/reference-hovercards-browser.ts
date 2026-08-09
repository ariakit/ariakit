import { expect } from "@playwright/test";
import { test } from "#app/test-utils/fixtures.ts";
import { gotoAndSettle } from "#app/test-utils/preview.ts";

// These paths and the asserted copy come from the Disclosure JSDoc in
// packages/ariakit-react-components/src/disclosure (the references content
// collection): the Disclosure description links to DisclosureContent, and the
// disabled prop docs start with "Determines if the element is disabled". If
// those docs change, update the assertions below.
const REFERENCE_PATH = "/react/components/disclosure/disclosure/";
const REFERENCE_PARTIAL_PATH =
  "/partials/react/components/disclosure/disclosure/";
const ITEM_PARTIAL_PATH =
  "/partials/react/components/disclosure/disclosure/prop-disabled/";

test("reference partial pages are served", async ({ baseURL }) => {
  if (!baseURL) {
    throw new Error("Missing baseURL");
  }
  const referenceResponse = await fetch(
    new URL(REFERENCE_PARTIAL_PATH, baseURL),
  );
  expect(referenceResponse.status).toBe(200);
  const referenceHtml = await referenceResponse.text();
  expect(referenceHtml).toContain("Disclosure");
  expect(referenceHtml).toContain("Optional Props");

  const itemResponse = await fetch(new URL(ITEM_PARTIAL_PATH, baseURL));
  expect(itemResponse.status).toBe(200);
  const itemHtml = await itemResponse.text();
  expect(itemHtml).toContain("Determines if the element is disabled");
});

test("reference hovercard shows partial content on hover", async ({
  page,
  q,
}) => {
  await gotoAndSettle(page, REFERENCE_PATH);
  // The Disclosure description links to the DisclosureContent reference; the
  // example code block renders more anchors with the same name, so take the
  // first (the description link).
  const anchor = q.link("DisclosureContent").first();
  // Hovercard anchors hydrate lazily (client:idle), and a pointer that is
  // already resting on the anchor when hydration completes never produces a
  // pointerenter event. Move the pointer away and re-hover until the
  // hovercard opens.
  await expect(async () => {
    await page.mouse.move(0, 0);
    await anchor.hover();
    await expect(q.dialog()).toBeVisible({ timeout: 2000 });
  }).toPass({ timeout: 20_000 });
  // The hovercard fetches the DisclosureContent reference partial on demand
  // and renders its content.
  await expect(q.dialog()).toContainText("Optional Props", {
    timeout: 10_000,
  });
});
