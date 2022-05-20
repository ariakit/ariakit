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

  // each char should dispatch hover and set selection

  const startIndex = element.textContent?.indexOf(text) ?? -1;
  const endIndex = startIndex + text.length;
  const iterator = document.createNodeIterator(element, NodeFilter.SHOW_TEXT);

  let node: Node | null = null;
  let i = startIndex;
  let count = 0;

  let startContainer: Node | null = null;
  let startOffset = -1;
  let endContainer: Node | null = null;
  let endOffset = -1;

  while (
    i >= 0 &&
    i < endIndex &&
    count < endIndex &&
    (node = iterator.nextNode())
  ) {
    const textContent = node.textContent;
    if (!textContent) continue;
    count += textContent.length;
    if (i > count) continue;
    if (!startContainer) {
      startContainer = node;
      startOffset = i - count + textContent.length;
    }
    endContainer = node;
    endOffset = endIndex - count + textContent.length;
    i += 1;
  }

  console.log(
    startContainer?.textContent,
    startOffset,
    endContainer?.textContent,
    endOffset
  );

  for (const char of text) {
    // await hover(element, options);
    // const range = document.createRange();
    // range.
  }

  // if (window.getSelection) {
  //   const selection = window.getSelection();
  //   const range = document.createRange();
  //   range.selectNodeContents(node);
  //   selection.removeAllRanges();
  //   selection.addRange(range);
  // }

  // change selection

  mouseUp(element, options);

  fireEvent.click(element, { detail: 1, ...options });

  // change selection
  await sleep();
}
