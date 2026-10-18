import { expect } from "@playwright/test";
import { test } from "#app/test-utils/fixtures.ts";

// These paths and the asserted copy come from the Disclosure JSDoc in
// packages/ariakit-react-components/src/disclosure (the references content
// collection): the Disclosure description links to DisclosureContent, and the
// disabled prop docs start with "Determines if the element is disabled". If
// those docs change, update the assertions below.
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
