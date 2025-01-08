import { basename, dirname } from "node:path";
import {
  getTextboxSelection,
  getTextboxValue,
  isTextbox,
} from "@ariakit/core/utils/dom";
import { test as base } from "@playwright/test";
import type { Locator, Page, PageScreenshotOptions } from "@playwright/test";

export const test = base.extend<{ forEachTest: void }>({
  forEachTest: [
    async ({ page }, use, testInfo) => {
      const name = basename(dirname(testInfo.file));
      await page.goto(`/previews/${name}`, { waitUntil: "networkidle" });
      await use();
    },
    { auto: true },
  ],
});

interface ScreenshotOptions {
  page: Page;
  name: string;
  elements?: Locator[];
  width?: number;
  height?: number | "auto";
  padding?: number;
  paddingX?: number;
  paddingY?: number;
  paddingTop?: number;
  paddingBottom?: number;
  paddingLeft?: number;
  paddingRight?: number;
  colorScheme?: "light" | "dark";
  transparent?: boolean;
  style?: string;
  clip?: PageScreenshotOptions["clip"];
  caret?: "initial" | "hide" | "force";
}

export async function screenshot({
  page,
  name,
  elements = [],
  width,
  height,
  padding = 64,
  paddingX = padding,
  paddingY = padding,
  paddingTop = paddingY,
  paddingBottom = paddingY,
  paddingLeft = paddingX,
  paddingRight = paddingX,
  colorScheme,
  transparent = true,
  style,
  clip: originalClip,
  caret = "initial",
}: ScreenshotOptions) {
  const colorSchemes = colorScheme
    ? [colorScheme]
    : (["light", "dark"] as const);

  if (transparent) {
    await page.evaluate(() => {
      document.body.style.background = "transparent";
      document.body.querySelector("div")!.style.background = "transparent";
    });
  }

  // Wait for the page to finish animating
  await page.evaluate(() =>
    Promise.all(
      document.body
        .getAnimations({ subtree: true })
        .map(
          (animation) => animation.playState === "paused" || animation.finished,
        ),
    ),
  );

  let clip = originalClip;

  if (!clip) {
    for (const element of elements) {
      const boundingBox = await element.boundingBox();
      if (!boundingBox) continue;

      if (!clip) {
        clip = { ...boundingBox };
      } else {
        const newX = Math.min(clip.x, boundingBox.x);
        const newY = Math.min(clip.y, boundingBox.y);
        const newWidth: number =
          Math.max(clip.x + clip.width, boundingBox.x + boundingBox.width) -
          newX;
        const newHeight: number =
          Math.max(clip.y + clip.height, boundingBox.y + boundingBox.height) -
          newY;
        clip = {
          x: newX,
          y: newY,
          width: newWidth,
          height: newHeight,
        };
      }
    }
  }

  if (clip) {
    clip.x -= paddingLeft;
    clip.y -= paddingTop;
    clip.width += paddingLeft + paddingRight;
    clip.height += paddingTop + paddingBottom;

    if (width) {
      clip.width = width;
    }
    if (height) {
      clip.height = height === "auto" ? clip.width || clip.height : height;
    }
  }

  for (const colorScheme of colorSchemes) {
    page.emulateMedia({ colorScheme });

    const folder = `${dirname(test.info().file)}/images`;
    const path = `${folder}/${name}-${colorScheme}.png`;

    // Force the caret to appear
    if (caret === "force") {
      const activeElement = await page.evaluate(
        () => document.activeElement as HTMLElement | null,
      );
      if (activeElement && isTextbox(activeElement)) {
        const selection = getTextboxSelection(activeElement);
        const value = getTextboxValue(activeElement);
        const collapsedAtEnd = selection.start === value.length;
        if (collapsedAtEnd) {
          await page.keyboard.press("Backspace");
          await page.keyboard.type(value.slice(0, -1));
        }
      }
    }

    await page.screenshot({
      path,
      clip,
      caret: caret === "hide" ? "hide" : "initial",
      omitBackground: true,
      style,
    });
  }
}
