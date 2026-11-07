import type { FrameLocator, Locator } from "@playwright/test";
import { expect } from "@playwright/test";
import { test } from "#app/test-utils/fixtures.ts";
import { gotoPreviewInCard } from "./preview-cards-helpers.ts";

// Headless Chrome hides scrollbars, and macOS shows overlay scrollbars, which
// take no room. Without the flag, a styled scrollbar takes room on any system,
// as a classic scrollbar on Windows or Linux does.
test.use({ launchOptions: { ignoreDefaultArgs: ["--hide-scrollbars"] } });

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => {
    if (window.self === window.top) return;
    document.addEventListener("DOMContentLoaded", () => {
      const style = document.createElement("style");
      style.textContent = "::-webkit-scrollbar { width: 15px; height: 15px; }";
      document.head.append(style);
    });
  });
});

// The room between the margin box of the last element of the page and the
// bottom of the area that the frame shows above its horizontal scrollbar.
async function getBottomRoom(last: Locator) {
  return last.evaluate((element) => {
    const { marginBottom } = getComputedStyle(element);
    const { bottom } = element.getBoundingClientRect();
    const { clientHeight } = element.ownerDocument.documentElement;
    return clientHeight - bottom - Number.parseFloat(marginBottom);
  });
}

async function getScrollbarHeight(frame: FrameLocator) {
  return frame.locator("html").evaluate((html) => {
    return window.innerHeight - html.clientHeight;
  });
}

// A wide example in a narrow card makes the page scroll horizontally. The
// element stays on one line, so the page keeps its height.
async function setMinWidth(locator: Locator, width: string) {
  await locator.evaluate((element, width) => {
    if (!(element instanceof HTMLElement)) return;
    element.style.minWidth = width;
  }, width);
}

const previews = [
  {
    name: "an Astro",
    src: "/react/previews/popover-preview-card-size/",
    // The grid is the last element of the page too.
    example: "[data-preview-content] .grid",
  },
  {
    name: "a Next.js",
    src: "/react/previews/preview-card-size-nextjs/",
    // The footer is the last element of the page and stays on one line.
    example: "footer",
  },
];

for (const { name, src, example } of previews) {
  // https://github.com/ariakit/ariakit/issues/8315
  test(`preview card frames fit a classic horizontal scrollbar below ${name} example`, async ({
    page,
  }) => {
    const iframe = await gotoPreviewInCard(page, src);
    const frame = iframe.contentFrame();
    await expect(frame.locator(example)).toBeVisible();
    const root = frame.locator("html");
    const getHeight = () => {
      return iframe.evaluate((element) => {
        return element.getBoundingClientRect().height;
      });
    };
    const getRoom = () => getBottomRoom(frame.locator(example));
    // The bottom padding of the page.
    await expect.poll(getRoom).toBe(32);
    expect(await getScrollbarHeight(frame)).toBe(0);
    const height = await getHeight();

    await setMinWidth(frame.locator(example), "3000px");
    await expect.poll(() => getScrollbarHeight(frame)).toBe(15);
    // An inactive frame can't scroll the covered part into view.
    await expect(root).not.toHaveAttribute("data-preview-active", "");
    await expect.poll(getRoom).toBe(32);
    expect(await getHeight()).toBe(height + 15);

    // The active frame shows a vertical scrollbar too, which takes no height.
    // The click lands on empty room in the example, past its first line.
    await frame.locator(example).click({ position: { x: 400, y: 4 } });
    await expect(root).toHaveAttribute("data-preview-active", "");
    await expect.poll(getRoom).toBe(32);
    expect(await getHeight()).toBe(height + 15);

    await setMinWidth(frame.locator(example), "");
    await expect.poll(getHeight).toBe(height);
    expect(await getScrollbarHeight(frame)).toBe(0);
    expect(await getRoom()).toBe(32);
  });
}

// https://github.com/ariakit/ariakit/issues/8315
test("preview card frames follow a classic horizontal scrollbar that no element in the flow causes", async ({
  page,
}) => {
  const iframe = await gotoPreviewInCard(
    page,
    "/react/previews/popover-preview-card-size/",
  );
  const frame = iframe.contentFrame();
  const example = frame.locator("[data-preview-content] .grid");
  await expect(example).toBeVisible();
  const getRoom = () => getBottomRoom(example);
  await expect.poll(getRoom).toBe(32);
  // A decoration out of the flow resizes none of the elements in the flow. A
  // stylesheet in the head places it past the edge of the page without a DOM
  // change in the body, which would update the size on its own.
  const style = await example.evaluateHandle((element) => {
    const style = element.ownerDocument.createElement("style");
    style.textContent = `body::after {
      content: "";
      position: absolute;
      top: 0;
      left: 3000px;
      width: 1rem;
      height: 1rem;
    }`;
    element.ownerDocument.head.append(style);
    return style;
  });
  await expect.poll(() => getScrollbarHeight(frame)).toBe(15);
  await expect.poll(getRoom).toBe(32);

  await style.evaluate((element) => element.remove());
  await expect.poll(() => getScrollbarHeight(frame)).toBe(0);
  await expect.poll(getRoom).toBe(32);
});
