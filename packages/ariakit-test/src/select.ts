import { isVisible } from "@ariakit/core/utils/dom";
import { invariant } from "@ariakit/core/utils/misc";
import { wrapAsync } from "./__utils.js";
import { dispatch } from "./dispatch.js";
import { hover } from "./hover.js";
import { mouseDown } from "./mouse-down.js";
import { mouseUp } from "./mouse-up.js";
import { sleep } from "./sleep.js";

export function select(
  text: string,
  element: Element | null = document.body,
  options?: MouseEventInit,
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
    const range = document.createRange();

    for (let i = 1; i <= text.length; i++) {
      const iterator = document.createNodeIterator(
        element,
        NodeFilter.SHOW_TEXT,
      );
      const textSlice = text.slice(0, i);
      const endIndex = startIndex + textSlice.length;
      let index = startIndex;
      let node: Node | null = null;
      let charCount = 0;
      let startContainer: Node | null = null;
      let startOffset = -1;
      let endContainer: Node | null = null;
      let endOffset = -1;

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

      if (!startContainer || !endContainer) continue;

      await hover(element, options);

      range.setStart(startContainer, startOffset);
      range.setEnd(endContainer, endOffset);
      selection?.removeAllRanges();
      selection?.addRange(range);
    }

    await sleep();

    await mouseUp(element, options);

    await dispatch.click(element, { detail: 1, ...options });

    // Fires selectionchange again
    selection?.removeAllRanges();
    selection?.addRange(range);

    await sleep();
  });
}
