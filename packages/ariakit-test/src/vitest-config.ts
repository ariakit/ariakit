import type { Frame, Page } from "@playwright/test";
import type { BrowserCommandContext } from "vitest/node";

type Modifier = "Alt" | "Control" | "Meta" | "Shift";

interface PointerOptions {
  button?: "left" | "middle" | "right";
  force?: boolean;
  modifiers?: Modifier[];
  position?: { x: number; y: number };
}

interface ElementCommand {
  selector: string;
  temporaryAttribute?: string;
}

interface PointerCommand extends ElementCommand {
  options: PointerOptions;
}

interface PressCommand extends ElementCommand {
  browser: string;
  key: string;
  modifiers: Modifier[];
}

interface TextSelection {
  start: number | null;
  end: number | null;
  direction: "forward" | "backward" | "none" | null;
  isMac: boolean;
  valueLength: number;
}

interface PlaywrightCommandContext extends BrowserCommandContext {
  frame(): Promise<Frame>;
  page: Page;
}

async function focusTestFrame(context: PlaywrightCommandContext) {
  const testFrame = await context.frame();
  await testFrame.evaluate(() => window.focus());
  return testFrame;
}

async function getElement(
  context: BrowserCommandContext,
  selector: string,
  temporaryAttribute?: string,
) {
  const playwrightContext = context as PlaywrightCommandContext;
  const testFrame = await focusTestFrame(playwrightContext);
  const locator = testFrame.locator(selector);
  const element = await locator.elementHandle();
  if (!element) {
    throw new Error(`Unable to locate element: ${selector}`);
  }
  if (temporaryAttribute) {
    await element.evaluate((element, attribute) => {
      element.removeAttribute(attribute);
    }, temporaryAttribute);
  }
  return element;
}

async function ariakitClick(
  context: BrowserCommandContext,
  { selector, temporaryAttribute, options }: PointerCommand,
) {
  const element = await getElement(context, selector, temporaryAttribute);
  await element.click(options);
}

async function ariakitTab(
  context: BrowserCommandContext,
  shift: boolean,
  webkit: boolean,
) {
  const playwrightContext = context as PlaywrightCommandContext;
  const modifier = webkit ? "Alt+" : "";
  const direction = shift ? "Shift+Tab" : "Tab";
  await focusTestFrame(playwrightContext);
  await playwrightContext.page.keyboard.press(`${modifier}${direction}`);
}

async function ariakitHover(
  context: BrowserCommandContext,
  { selector, temporaryAttribute, options }: PointerCommand,
) {
  const element = await getElement(context, selector, temporaryAttribute);
  await element.hover(options);
}

async function ariakitPress(
  context: BrowserCommandContext,
  { selector, temporaryAttribute, browser, key, modifiers }: PressCommand,
) {
  const element = await getElement(context, selector, temporaryAttribute);
  const focused = await element.evaluate((element) => {
    const root = element.getRootNode();
    if (root instanceof Document || root instanceof ShadowRoot) {
      return root.activeElement === element;
    }
    return false;
  });
  const selection = await element.evaluate((element): TextSelection | null => {
    if (
      !(element instanceof HTMLInputElement) &&
      !(element instanceof HTMLTextAreaElement)
    ) {
      return null;
    }
    return {
      start: element.selectionStart,
      end: element.selectionEnd,
      direction: element.selectionDirection,
      isMac: navigator.platform.startsWith("Mac"),
      valueLength: element.value.length,
    };
  });

  if (!focused) {
    await element.focus();
  }
  if (selection?.start != null && selection.end != null) {
    await element.evaluate((element, selection) => {
      if (
        !(element instanceof HTMLInputElement) &&
        !(element instanceof HTMLTextAreaElement)
      ) {
        return;
      }
      element.setSelectionRange(
        selection.start,
        selection.end,
        selection.direction || undefined,
      );
    }, selection);
  }

  const needsCaretFallback =
    selection &&
    !modifiers.includes("Alt") &&
    !modifiers.includes("Control") &&
    !modifiers.includes("Meta") &&
    (key === "Home" || key === "End");

  const stateProperty = `__ariakitPress${crypto.randomUUID().replaceAll("-", "")}`;
  if (needsCaretFallback) {
    await element.evaluate((element, stateProperty) => {
      element.addEventListener(
        "keydown",
        (event) => {
          Object.assign(element, { [stateProperty]: event });
        },
        { capture: true, once: true },
      );
    }, stateProperty);
  }

  await element.press([...modifiers, key].join("+"));

  if (!needsCaretFallback) return;

  await element.evaluate(
    (element, { key, selection, shiftKey, stateProperty }) => {
      const event = Reflect.get(element, stateProperty) as
        | KeyboardEvent
        | undefined;
      Reflect.deleteProperty(element, stateProperty);
      if (!event) return;
      if (
        !(element instanceof HTMLInputElement) &&
        !(element instanceof HTMLTextAreaElement)
      ) {
        return;
      }
      if (event.defaultPrevented) {
        if (selection.start == null) return;
        if (selection.end == null) return;
        element.setSelectionRange(
          selection.start,
          selection.end,
          selection.direction || undefined,
        );
        return;
      }
      if (
        element.selectionStart !== selection.start ||
        element.selectionEnd !== selection.end
      ) {
        return;
      }
      const position = key === "Home" ? 0 : selection.valueLength;
      if (!shiftKey) {
        element.setSelectionRange(position, position);
        return;
      }
      // macOS Chromium and WebKit expand the physical selection in the key's
      // direction. Firefox and the Linux engines extend the logical anchor.
      if (selection.isMac && browser !== "firefox") {
        element.setSelectionRange(
          key === "Home" ? position : selection.start,
          key === "End" ? position : selection.end,
          selection.direction || undefined,
        );
        return;
      }
      const anchor =
        selection.direction === "backward" ? selection.end : selection.start;
      if (anchor == null) return;
      element.setSelectionRange(
        Math.min(anchor, position),
        Math.max(anchor, position),
        position < anchor ? "backward" : "forward",
      );
    },
    {
      browser,
      key,
      selection,
      shiftKey: modifiers.includes("Shift"),
      stateProperty,
    },
  );
}

/**
 * Server commands required by the `@ariakit/test/vitest` browser setup entry.
 *
 * @example
 * ```ts
 * import { ariakitBrowserCommands } from "@ariakit/test/vitest-config";
 *
 * export default defineConfig({
 *   test: { browser: { commands: ariakitBrowserCommands } },
 * });
 * ```
 */
export const ariakitBrowserCommands = {
  ariakitClick,
  ariakitHover,
  ariakitPress,
  ariakitTab,
};
