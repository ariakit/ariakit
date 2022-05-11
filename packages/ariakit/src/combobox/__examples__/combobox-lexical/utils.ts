import { $getSelection, $isRangeSelection, LexicalEditor } from "lexical";

type IsTrigger = (text: string) => boolean;

export function $getRangeSelection() {
  const selection = $getSelection();
  if (!$isRangeSelection(selection)) return null;
  return selection;
}

export function getSelectionAnchor(editor: LexicalEditor) {
  return editor.getEditorState().read(() => {
    const selection = $getRangeSelection();
    if (!selection) return null;
    const anchor = selection.anchor;
    if (anchor.type !== "text") return null;
    if (!anchor.getNode().isSimpleText()) return null;
    return anchor;
  });
}

export function getSelectionText(editor: LexicalEditor) {
  return editor.getEditorState().read(() => {
    const anchor = getSelectionAnchor(editor);
    if (!anchor) return "";
    return anchor.getNode().getTextContent();
  });
}

export function getTextBeforeCursor(editor: LexicalEditor) {
  return editor.getEditorState().read(() => {
    const anchor = getSelectionAnchor(editor);
    if (!anchor) return "";
    return anchor.getNode().getTextContent().slice(0, anchor.offset);
  });
}

export function getSelectionElement(editor: LexicalEditor) {
  return editor.getEditorState().read(() => {
    const selection = $getRangeSelection();
    if (!selection) return null;
    return editor.getElementByKey(selection.anchor.key);
  });
}

export function getTriggerOffset(value: string, isTrigger: IsTrigger) {
  for (let i = value.length; i >= 0; i--) {
    const trigger = value[i];
    if (trigger && isTrigger(trigger)) return i;
  }
  return -1;
}

export function getTriggerInPreviousChar(value: string, isTrigger: IsTrigger) {
  const previousChar = value[value.length - 1];
  if (!previousChar) return null;
  const secondPreviousChar = value[value.length - 2];
  const isIsolated = !secondPreviousChar || /\s/.test(secondPreviousChar);
  if (!isIsolated) return null;
  if (isTrigger?.(previousChar)) return previousChar;
  return null;
}

export function getSearchText(value: string, isTrigger: IsTrigger) {
  const offset = getTriggerOffset(value, isTrigger);
  if (offset === -1) return "";
  return value.slice(offset + 1);
}
