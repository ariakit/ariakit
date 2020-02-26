/**
 * Check whether the given element is a text field, where text field is defined
 * by the ability to select within the input, or that it is contenteditable.
 */
export function isTextField(element: HTMLElement): boolean {
  try {
    const isTextInput =
      element instanceof HTMLInputElement && element.selectionStart !== null;
    const isTextArea = element.tagName === "TEXTAREA";
    const isContentEditable = element.contentEditable === "true";
    return isTextInput || isTextArea || isContentEditable || false;
  } catch (error) {
    // Safari throws an exception when trying to get `selectionStart`
    // on non-text <input> elements (which, understandably, don't
    // have the text selection API). We catch this via a try/catch
    // block, as opposed to a more explicit check of the element's
    // input types, because of Safari's non-standard behavior. This
    // also means we don't have to worry about the list of input
    // types that support `selectionStart` changing as the HTML spec
    // evolves over time.
    return false;
  }
}
