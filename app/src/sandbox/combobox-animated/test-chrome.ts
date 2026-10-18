import type { Page } from "@playwright/test";
import { expect } from "@playwright/test";
import { withFramework } from "#app/test-utils/preview.ts";

declare global {
  interface Window {
    listboxTransitions?: string[];
  }
}

// Sampling getAnimations() once can miss the 200ms transition on a slow
// machine, so record the listbox transition events as they happen instead.
function recordListboxTransitions(page: Page) {
  return page.evaluate(() => {
    const types: string[] = [];
    const record = (event: Event) => {
      if (!(event instanceof TransitionEvent)) return;
      if (event.propertyName !== "opacity") return;
      if (!(event.target instanceof Element)) return;
      if (event.target.getAttribute("role") !== "listbox") return;
      types.push(event.type);
    };
    for (const type of ["transitionrun", "transitionend", "transitioncancel"]) {
      document.addEventListener(type, record, true);
    }
    window.listboxTransitions = types;
  });
}

function getListboxTransitions(page: Page) {
  return page.evaluate(() => window.listboxTransitions ?? []);
}

function clearListboxTransitions(page: Page) {
  return page.evaluate(() => {
    if (window.listboxTransitions) window.listboxTransitions.length = 0;
  });
}

withFramework(import.meta.dirname, async ({ test }) => {
  test("combobox show/hide animation", async ({ page, q }) => {
    const combobox = q.combobox("Your favorite fruit");
    const listbox = q.listbox();
    await recordListboxTransitions(page);

    await combobox.click();
    await expect(listbox).toBeVisible();
    await expect(listbox).toHaveCSS("transition-duration", "0.2s");
    await expect
      .poll(() => getListboxTransitions(page))
      .toEqual(["transitionrun", "transitionend"]);

    await clearListboxTransitions(page);
    await q.option("🍎 Apple").click();
    await expect(combobox).toBeFocused();
    await expect(listbox).not.toBeVisible();
    // Ariakit hides the listbox when its leave timer fires, which on a slow
    // machine can cancel the transition before transitionend is dispatched. The
    // transition still ran, so only its start is required here.
    await expect
      .poll(async () => (await getListboxTransitions(page))[0])
      .toBe("transitionrun");
  });
});
