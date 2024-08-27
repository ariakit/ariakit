import { dirname } from "node:path";
import { test } from "@playwright/test";
import type { Locator, Page, PageScreenshotOptions } from "@playwright/test";

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
}: ScreenshotOptions) {
  const colorSchemes = colorScheme
    ? [colorScheme]
    : (["light", "dark"] as const);

  await page.evaluate(() => {
    document.body.style.background = "transparent";
    document.body.querySelector("div")!.style.background = "transparent";
  });

  let clip: PageScreenshotOptions["clip"] | undefined = undefined;

  for (const element of elements) {
    const boundingBox = await element.boundingBox();

    if (boundingBox) {
      clip = clip || boundingBox;
      clip.x = Math.min(clip.x, boundingBox.x);
      clip.y = Math.min(clip.y, boundingBox.y);
      clip.width = Math.max(
        clip.width,
        boundingBox.x + boundingBox.width - clip.x,
      );
      clip.height = Math.max(
        clip.height,
        boundingBox.y + boundingBox.height - clip.y,
      );
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

    await page.screenshot({
      path,
      clip,
      caret: "initial",
      omitBackground: true,
    });
  }
}
