import { test } from "#app/test-utils/fixtures.ts";
import { gotoAndSettle } from "#app/test-utils/preview.ts";

type Listener = EventListenerOrEventListenerObject;
type AddListenerOptions = boolean | AddEventListenerOptions;
type RemoveListenerOptions = boolean | EventListenerOptions;

interface TocAuditState {
  scrollListeners: Set<Listener>;
  scrollAddCount: number;
  beforePreparationOnceCount: number;
  tocObservers: Set<IntersectionObserver>;
  tocDisconnectCount: number;
}

declare global {
  interface Window {
    __tocAudit: TocAuditState;
  }
}

test("does not duplicate TOC setup across Astro page loads", async ({
  page,
}) => {
  await page.addInitScript(() => {
    window.__tocAudit = {
      scrollListeners: new Set(),
      scrollAddCount: 0,
      beforePreparationOnceCount: 0,
      tocObservers: new Set(),
      tocDisconnectCount: 0,
    };

    const windowAddEventListener = window.addEventListener.bind(window);
    const windowRemoveEventListener = window.removeEventListener.bind(window);
    const documentAddEventListener = document.addEventListener.bind(document);
    const OriginalIntersectionObserver = window.IntersectionObserver;

    window.addEventListener = ((
      type: string,
      listener: Listener,
      options?: AddListenerOptions,
    ) => {
      if (type === "scroll") {
        window.__tocAudit.scrollListeners.add(listener);
        window.__tocAudit.scrollAddCount += 1;
      }
      return windowAddEventListener(type, listener, options);
    }) satisfies typeof window.addEventListener;

    window.removeEventListener = ((
      type: string,
      listener: Listener,
      options?: RemoveListenerOptions,
    ) => {
      if (type === "scroll") {
        window.__tocAudit.scrollListeners.delete(listener);
      }
      return windowRemoveEventListener(type, listener, options);
    }) satisfies typeof window.removeEventListener;

    document.addEventListener = ((
      type: string,
      listener: Listener,
      options?: AddListenerOptions,
    ) => {
      if (
        type === "astro:before-preparation" &&
        typeof options === "object" &&
        options?.once === true
      ) {
        window.__tocAudit.beforePreparationOnceCount += 1;
      }
      return documentAddEventListener(type, listener, options);
    }) satisfies typeof document.addEventListener;

    window.IntersectionObserver = class extends OriginalIntersectionObserver {
      observe(target: Element) {
        const tocLinks = document.querySelectorAll("[data-heading-link]");
        const observesTocHeading =
          target instanceof HTMLElement &&
          Array.from(tocLinks).some((link) => {
            return link.getAttribute("data-heading-link") === target.id;
          });
        if (observesTocHeading) {
          window.__tocAudit.tocObservers.add(this);
        }
        return super.observe(target);
      }

      disconnect() {
        if (window.__tocAudit.tocObservers.has(this)) {
          window.__tocAudit.tocDisconnectCount += 1;
        }
        return super.disconnect();
      }
    };
  });

  await gotoAndSettle(page, "/react/components/styling/");
  await test
    .expect(page.locator("[data-table-of-contents]"))
    .toHaveCount(1, { timeout: 30_000 });
  await test
    .expect(
      page.locator(
        "[data-table-of-contents][data-table-of-contents-initialized]",
      ),
    )
    .toHaveCount(1, { timeout: 30_000 });

  await page.evaluate(() => {
    document.dispatchEvent(new Event("astro:page-load"));
    document.dispatchEvent(new Event("astro:page-load"));
  });

  await test.expect
    .poll(() =>
      page.evaluate(() => ({
        beforePreparationOnceCount:
          window.__tocAudit.beforePreparationOnceCount,
        initializedCount: document.querySelectorAll(
          "[data-table-of-contents][data-table-of-contents-initialized]",
        ).length,
        scrollAddCount: window.__tocAudit.scrollAddCount,
        scrollListenerCount: window.__tocAudit.scrollListeners.size,
        tocObserverCount: window.__tocAudit.tocObservers.size,
      })),
    )
    .toEqual({
      beforePreparationOnceCount: 1,
      initializedCount: 1,
      scrollAddCount: 1,
      scrollListenerCount: 1,
      tocObserverCount: 1,
    });

  await page.evaluate(() => {
    document.dispatchEvent(new Event("astro:before-preparation"));
    document.dispatchEvent(new Event("astro:before-preparation"));
  });

  await test.expect
    .poll(() =>
      page.evaluate(() => ({
        initializedCount: document.querySelectorAll(
          "[data-table-of-contents][data-table-of-contents-initialized]",
        ).length,
        scrollListenerCount: window.__tocAudit.scrollListeners.size,
        tocDisconnectCount: window.__tocAudit.tocDisconnectCount,
      })),
    )
    .toEqual({
      initializedCount: 0,
      scrollListenerCount: 0,
      tocDisconnectCount: 1,
    });
});
