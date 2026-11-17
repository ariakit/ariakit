import { query } from "@ariakit/test/playwright";
import type { Locator } from "@playwright/test";
import { expect } from "@playwright/test";
import { test } from "#app/test-utils/fixtures.ts";
import { flushFrames, gotoAndSettle } from "#app/test-utils/preview.ts";

// A card hydrates as it comes near the viewport, and a click before then does
// nothing. Astro removes the ssr attribute of the island once it hydrates.
async function waitForCardHydration(card: Locator) {
  await card.scrollIntoViewIfNeeded();
  await expect(card.locator("astro-island").first()).not.toHaveAttribute("ssr");
}

test("preview card code opens in a dialog with a tab for each file", async ({
  page,
  q,
}) => {
  const requests: string[] = [];
  page.on("request", (request) => {
    if (!request.url().includes("/partials/")) return;
    requests.push(request.url());
  });
  await gotoAndSettle(page, "/react/recipes/code-block/");
  const card = q.region("File Tabs");
  await waitForCardHydration(card);
  // A closed dialog renders no panel, so the card loads no file until the
  // pointer moves over its code button. No state shows a request that didn't
  // start, so the wait crosses the frame in which the island commits its
  // hydration and runs its effects, where an eager load would start.
  await flushFrames(page);
  expect(requests).toEqual([]);

  const getCode = query(card).button("Get code");
  await getCode.click();
  const dialog = query(q.dialog("File Tabs"));
  await expect(dialog.tab("index.tsx")).toHaveAttribute(
    "aria-selected",
    "true",
  );
  await expect(dialog.tabpanel("index.tsx")).toContainText(
    "export default function Example",
  );
  await expect(dialog.button("Copy index.tsx")).toBeVisible();

  // Another file loads from its partial page when its tab is selected.
  await dialog.tab("index.server.ts").click();
  await expect(dialog.tabpanel("index.server.ts")).toContainText(
    "export function load",
  );
  await expect(dialog.button("Copy index.server.ts")).toBeVisible();

  await page.keyboard.press("Escape");
  await expect(q.dialog("File Tabs")).not.toBeVisible();
  await expect(getCode).toBeFocused();

  // The dialog opens again on the file that was selected.
  await getCode.click();
  await expect(dialog.tab("index.server.ts")).toHaveAttribute(
    "aria-selected",
    "true",
  );
});

test("preview card code shows the files of a Next.js example", async ({
  page,
  q,
}) => {
  await gotoAndSettle(page, "/react/recipes/tabs/");
  const title = "Tabs with the Next.js App Router";
  const card = q.region(title);
  await waitForCardHydration(card);
  await query(card).button("Get code").click();
  const dialog = query(q.dialog(title));
  // A nested route keeps its folder in the name of its file.
  await dialog.tab("sent/page.tsx").click();
  await expect(dialog.tabpanel("sent/page.tsx")).toContainText(
    "export default function",
  );
});

test("preview card code keeps the focus in the code when the file arrives", async ({
  page,
  q,
}) => {
  // The requests wait until the test lets them go, so the code can take the
  // focus while the file loads.
  let release = () => {};
  const released = new Promise<void>((resolve) => {
    release = resolve;
  });
  await page.route(
    "**/partials/react/previews/code-block/files/**",
    async (route) => {
      await released;
      return route.fallback();
    },
  );
  await gotoAndSettle(page, "/react/recipes/code-block/");
  const card = q.region("Code Block");
  await waitForCardHydration(card);
  await query(card).button("Get code").click();
  const dialog = query(q.dialog("Code Block"));
  const panel = dialog.tabpanel("index.tsx");
  await expect(panel).toHaveAttribute("aria-busy", "true");
  const code = dialog.region("index.tsx");
  await code.focus();
  release();
  await expect(panel).not.toHaveAttribute("aria-busy");
  await expect(code).toContainText("export default function Example");
  await expect(code).toBeFocused();
});

test("preview card code tries a file again after a failed request", async ({
  page,
  q,
}) => {
  // The requests fail until the test tries again, as the dialog can try once
  // more on its own when the request that the hover started fails first.
  let failing = true;
  await page.route(
    "**/partials/react/previews/code-block/files/**",
    (route) => {
      if (!failing) return route.fallback();
      return route.fulfill({ status: 500 });
    },
  );
  // The examples on this page don't open popups or take the focus, which could
  // close the dialog or move the card under the pointer while they load.
  await gotoAndSettle(page, "/react/recipes/code-block/");
  const card = q.region("Code Block");
  await waitForCardHydration(card);
  await query(card).button("Get code").click();
  const dialog = query(q.dialog("Code Block"));
  // An alert takes no name from its content.
  await expect(dialog.alert()).toHaveText("Couldn't load index.tsx.");
  failing = false;
  await dialog.button("Try again").click();
  await expect(dialog.tabpanel("index.tsx")).toContainText(
    "export default function Example",
  );
  // The button leaves with the failure, and the focus stays in the dialog.
  await expect(dialog.tab("index.tsx")).toBeFocused();
});

test("preview card code keeps the card when the dialog fails to load", async ({
  page,
  q,
}) => {
  // The dialog is a module of its own, in dev and in the build. Its request
  // waits until the test lets it fail, so the test sees the dialog open first.
  let failing = true;
  let fail = () => {};
  const failed = new Promise<void>((resolve) => {
    fail = resolve;
  });
  await page.route("**/preview-card-code.react.*", async (route) => {
    if (!failing) return route.fallback();
    await failed;
    return route.abort();
  });
  await gotoAndSettle(page, "/react/recipes/code-block/");
  const card = q.region("Code Block");
  await waitForCardHydration(card);
  const getCode = query(card).button("Get code");
  await getCode.click();
  await expect(getCode).toHaveAttribute("aria-expanded", "true");
  fail();
  // The dialog closes, and the card and its example stay.
  await expect(getCode).toHaveAttribute("aria-expanded", "false");
  await expect(query(card).button("Reload preview")).toBeVisible();
  failing = false;
  await getCode.click();
  await expect(q.dialog("Code Block")).toBeVisible();
});

test("preview card code doesn't load a failed file again on its own", async ({
  context,
  page,
  q,
}) => {
  let requests = 0;
  await page.route(
    "**/partials/react/previews/code-block/files/**",
    (route) => {
      requests++;
      return route.fulfill({ status: 500 });
    },
  );
  await gotoAndSettle(page, "/react/recipes/code-block/");
  const card = q.region("Code Block");
  await waitForCardHydration(card);
  await query(card).button("Get code").click();
  const dialog = query(q.dialog("Code Block"));
  const tryAgain = dialog.button("Try again");
  await tryAgain.focus();
  const failedRequests = requests;
  // The visitor leaves the browser tab and comes back to it. A headless browser
  // fires no visibilitychange event, so the page fakes one.
  await page.evaluate(() => {
    const setVisibility = (visibility: DocumentVisibilityState) => {
      Object.defineProperty(document, "visibilityState", {
        configurable: true,
        get: () => visibility,
      });
      window.dispatchEvent(new Event("visibilitychange"));
    };
    setVisibility("hidden");
    setVisibility("visible");
  });
  // The network goes away and comes back.
  await context.setOffline(true);
  await context.setOffline(false);
  // No state shows a request that didn't start. A refetch would start its
  // request right after the event, and TanStack Query would replace the button
  // on a zero-delay timer. The frames let both happen, and let the route
  // handler count the request.
  await flushFrames(page);
  expect(requests).toBe(failedRequests);
  await expect(tryAgain).toBeFocused();
});
