import { isVisible, invariant } from "@ariakit/utils";
import { settle, wrapAsync } from "./__utils.ts";
import { dispatch } from "./dispatch.ts";
import { hover } from "./hover.ts";
import { mouseDown } from "./mouse-down.ts";
import { mouseUp } from "./mouse-up.ts";
import { sleep } from "./sleep.ts";

/**
 * Selects a range of text within an element, simulating a real user dragging
 * across it. Hovers and presses on the element, finds the given `text` in its
 * descendant text nodes, sets the document selection to cover it, then releases.
 *
 * When no element is passed, `document.body` is used. Pass `options` to set event
 * properties such as modifier keys.
 * @example
 * ```ts
 * await select("hello world");
 * expect(document.getSelection()?.toString()).toBe("hello world");
 * ```
 */
export function select(
  text: string,
  element: Element | null = document.body,
  options?: PointerEventInit,
) {
  return wrapAsync(async () => {
    invariant(element, "Unable to select text on null element");

    if (!isVisible(element)) return;

    const document = element.ownerDocument;

    await hover(element, options);
    await mouseDown(element, options);

    await dispatch(
      element,
      new Event("selectstart", {
        bubbles: true,
        cancelable: true,
        composed: false,
      }),
    );

    const startIndex = element.textContent?.indexOf(text) ?? -1;
    const selection = document.getSelection();
    const endIndex = startIndex + text.length;
    let index = startIndex;
    let node: Node | null = null;
    let charCount = 0;
    let startContainer: Node | null = null;
    let startOffset = -1;
    let endContainer: Node | null = null;
    let endOffset = -1;
    const iterator = document.createNodeIterator(element, NodeFilter.SHOW_TEXT);

    while (
      index >= 0 &&
      index < endIndex &&
      charCount < endIndex &&
      (node = iterator.nextNode())
    ) {
      const textContent = node.textContent;
      if (!textContent) continue;
      charCount += textContent.length;
      if (index > charCount) continue;
      if (!startContainer) {
        startContainer = node;
        startOffset = index - charCount + textContent.length;
      }
      endContainer = node;
      endOffset = endIndex - charCount + textContent.length;
      index++;
    }

    const range = document.createRange();

    if (startContainer && endContainer) {
      range.setStart(startContainer, startOffset);
      range.setEnd(endContainer, endOffset);
      selection?.removeAllRanges();
      selection?.addRange(range);
    }

    // Let the selection change flush before releasing — microtask/rAF settle.
    await settle();

    await mouseUp(element, options);

    await dispatch.click(element, { detail: 1, ...options });

    await sleep();
  });
}
