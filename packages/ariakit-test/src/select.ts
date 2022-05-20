import { fireEvent } from "./fire-event";
import { hover } from "./hover";
import { mouseDown } from "./mouse-down";
import { mouseUp } from "./mouse-up";
import { sleep } from "./sleep";

export async function select(
  element: Element,
  text: string,
  options?: MouseEventInit
) {
  const document = element.ownerDocument;

  await hover(element, options);
  mouseDown(element, options);

  element.dispatchEvent(
    new Event("selectstart", {
      bubbles: true,
      cancelable: true,
      composed: false,
    })
  );

  const startIndex = element.textContent?.indexOf(text) ?? -1;
  const selection = document.getSelection();
  const range: Range = document.createRange();

  for (let i = 1; i <= text.length; i++) {
    const iterator = document.createNodeIterator(element, NodeFilter.SHOW_TEXT);
    const currentText = text.slice(0, i);
    const endIndex = startIndex + currentText.length;
    let currentIndex = startIndex;
    let currentNode: Node | null = null;
    let currentCharCount = 0;
    let startContainer: Node | null = null;
    let startOffset = -1;
    let endContainer: Node | null = null;
    let endOffset = -1;

    while (
      currentIndex >= 0 &&
      currentIndex < endIndex &&
      currentCharCount < endIndex &&
      (currentNode = iterator.nextNode())
    ) {
      const textContent = currentNode.textContent;
      if (!textContent) continue;
      currentCharCount += textContent.length;
      if (currentIndex > currentCharCount) continue;
      if (!startContainer) {
        startContainer = currentNode;
        startOffset = currentIndex - currentCharCount + textContent.length;
      }
      endContainer = currentNode;
      endOffset = endIndex - currentCharCount + textContent.length;
      currentIndex++;
    }

    if (!startContainer || !endContainer) continue;

    await hover(element, options);

    range.setStart(startContainer, startOffset);
    range.setEnd(endContainer, endOffset);
    selection?.removeAllRanges();
    selection?.addRange(range);
  }

  mouseUp(element, options);

  fireEvent.click(element, { detail: 1, ...options });

  selection?.removeAllRanges();
  selection?.addRange(range);

  await sleep();
}
