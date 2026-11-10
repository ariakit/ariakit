/**
 * @license
 * Copyright 2025-present Ariakit FZ-LLC. All Rights Reserved.
 *
 * This software is proprietary. See the license.md file in the root of this
 * package for licensing terms.
 *
 * SPDX-License-Identifier: UNLICENSED
 */

/**
 * A level above the current page in the site trail. A level without a page of
 * its own, such as Recipes, has no `href`.
 */
export interface AppTrailStep {
  label: string;
  href?: string;
}

/** A trail step with a page to link to. */
interface AppTrailLinkStep extends AppTrailStep {
  href: string;
}

/** The top level of the site, which every trail starts from. */
export const homeStep: AppTrailLinkStep = { label: "Home", href: "/" };

/**
 * The trail of a page: the levels between the home page and the page, and the
 * name of the page.
 */
export interface AppTrail {
  steps: AppTrailStep[];
  current: string;
}

/**
 * Returns the trail of a page under a collection, such as Recipes. The
 * collection has no page, so its step has no link.
 */
export function getCollectionTrail(
  type: "components" | "recipes",
  current: string,
): AppTrail {
  const label = type === "components" ? "Components" : "Recipes";
  return { steps: [{ label }], current };
}

function hasHref(step: AppTrailStep): step is AppTrailLinkStep {
  return step.href != null;
}

/**
 * Returns schema.org structured data for a trail. The last item leaves out its
 * URL, and search engines then use the URL of the page. Search engines need a
 * URL on every other item, so steps without a link are left out.
 * @see https://developers.google.com/search/docs/appearance/structured-data/breadcrumb
 */
export function getTrailStructuredData(trail: AppTrail, site: string | URL) {
  const linkSteps = [homeStep, ...trail.steps].filter(hasHref);
  const steps = linkSteps.map((step, index) => ({
    "@type": "ListItem",
    position: index + 1,
    name: step.label,
    item: new URL(step.href, site).href,
  }));
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      ...steps,
      {
        "@type": "ListItem",
        position: steps.length + 1,
        name: trail.current,
      },
    ],
  };
}

/**
 * Serializes structured data for a script element. A title with `</script>`
 * must not end the element.
 */
export function serializeStructuredData(data: unknown) {
  return JSON.stringify(data).replaceAll("<", "\\u003c");
}
