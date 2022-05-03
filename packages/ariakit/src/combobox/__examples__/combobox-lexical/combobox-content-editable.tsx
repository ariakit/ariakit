import {
  KeyboardEvent as ReactKeyboardEvent,
  useCallback,
  useEffect,
  useRef,
} from "react";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { mergeRegister } from "@lexical/utils";
import {
  Combobox,
  ComboboxItem,
  ComboboxPopover,
  useComboboxState,
} from "ariakit/combobox";
import {
  $getSelection,
  $isRangeSelection,
  EditorConfig,
  KEY_ENTER_COMMAND,
  KEY_ESCAPE_COMMAND,
  KEY_TAB_COMMAND,
  LexicalEditor,
  LexicalNode,
  TextNode,
} from "lexical";
import { defaultTriggers } from "./list";

export function ComboboxContentEditable() {
  const anchorRectRef = useRef<() => DOMRect | null>(() => null);
  const combobox = useComboboxState({
    getAnchorRect: () => anchorRectRef.current(),
  });
  const [editor] = useLexicalComposerContext();

  useEffect(() => {
    if (!editor.hasNodes([MentionNode])) {
      throw new Error(
        "ComboboxContentEditable: MentionNode not registered on editor"
      );
    }
  }, [editor]);

  useEffect(() => {
    if (!combobox.visible) return;
    combobox.move(combobox.first());
  }, [combobox.visible, combobox.move, combobox.first]);

  useEffect(() => {
    return editor.registerCommand(KEY_ESCAPE_COMMAND, () => true, 1);
  }, [editor]);

  useEffect(() => {
    if (!combobox.visible) return;
    if (!combobox.activeId) return;
    return mergeRegister(
      editor.registerCommand(KEY_ENTER_COMMAND, () => true, 1),
      editor.registerCommand(
        KEY_TAB_COMMAND,
        (event: KeyboardEvent | null) => {
          if (event) {
            event.preventDefault();
          }
          // should apply selected item
          return true;
        },
        1
      )
    );
  }, [editor, combobox.visible, combobox.activeId]);

  useEffect(() => {
    return editor.registerTextContentListener(() => {
      const value = getTextBeforeCursor(editor);
      const triggerOffset = getTriggerOffset(value);
      if (triggerOffset === -1) {
        combobox.hide();
      }
      const trigger = getTriggerInPreviousChar(value);
      const selectionElement = getSelectionElement(editor);
      if (!selectionElement) return;
      if (!selectionElement.firstChild) return;
      const searchValue = getSearchValue(value);
      combobox.setValue(searchValue);
      const range = document.createRange();
      range.setStart(selectionElement.firstChild, triggerOffset + 1);
      range.collapse();
      combobox.anchorRef.current = selectionElement;
      anchorRectRef.current = () => range.getBoundingClientRect();
      if (trigger) {
        combobox.show();
      }
    });
  }, [editor]);

  const ref = useCallback(
    (rootElement: HTMLElement | null) => {
      editor.setRootElement(rootElement);
    },
    [editor]
  );

  return (
    <>
      <Combobox
        as="div"
        ref={ref}
        state={combobox}
        autoSelect
        showOnKeyDown={false}
        showOnMouseDown={false}
        setValueOnChange={false}
        onScroll={combobox.render}
        onPointerDown={combobox.hide}
        onKeyDown={(event: ReactKeyboardEvent) => {
          if (event.key === "ArrowLeft" || event.key === "ArrowRight") {
            combobox.hide();
          }
        }}
        contentEditable
        className="combobox"
      />
      <ComboboxPopover state={combobox} className="popover">
        <ComboboxItem
          value="Apple"
          className="combobox-item"
          onClick={() => {
            editor.update(() => {
              const selection = $getSelection();
              if (!$isRangeSelection(selection)) return;
              const value = getTextBeforeCursor(editor);
              const startOffset = getTriggerOffset(value);
              const selectionOffset = startOffset + 1 + combobox.value.length;
              const anchor = selection.anchor;
              if (anchor.type !== "text") return;
              const anchorNode = anchor.getNode();
              if (!anchorNode.isSimpleText()) return;
              // eslint-disable-next-line prefer-const
              let [orNode, nodeToReplace] = anchorNode.splitText(
                startOffset,
                selectionOffset
              );
              if (startOffset === 0) {
                nodeToReplace = orNode;
              }
              const mentionNode = $createMentionNode("Apple");
              nodeToReplace?.replace(mentionNode);
              mentionNode.select();
            });
          }}
        />
        <ComboboxItem value="Banana" className="combobox-item" />
        <ComboboxItem value="Cherry" className="combobox-item" />
      </ComboboxPopover>
    </>
  );
}

export class MentionNode extends TextNode {
  static getType() {
    return "mention";
  }

  static clone(node: MentionNode) {
    return new MentionNode(node.__text, node.__key);
  }

  createDOM(config: EditorConfig) {
    const dom = super.createDOM(config);
    dom.classList.add("mention");
    return dom;
  }

  isTextEntity() {
    return true;
  }
}

export function $createMentionNode(mentionName: string) {
  const mentionNode = new MentionNode(mentionName);
  mentionNode.setMode("segmented").toggleDirectionless();
  return mentionNode;
}

export function $isMentionNode(node: LexicalNode): node is MentionNode {
  return node instanceof MentionNode;
}

function getTextBeforeCursor(editor: LexicalEditor) {
  return editor.getEditorState().read(() => {
    const selection = $getSelection();
    if (!$isRangeSelection(selection)) return "";
    const anchor = selection.anchor;
    if (anchor.type !== "text") return "";
    const anchorNode = anchor.getNode();
    // We should not be attempting to extract mentions out of nodes that are
    // already being used for other core things. This is especially true for
    // immutable nodes, which can't be mutated at all.
    if (!anchorNode.isSimpleText()) return "";
    const anchorOffset = anchor.offset;
    return anchorNode.getTextContent().slice(0, anchorOffset);
  });
}

function getSelectionElement(editor: LexicalEditor) {
  return editor.getEditorState().read(() => {
    const selection = $getSelection();
    if (!$isRangeSelection(selection)) return null;
    const element = editor.getElementByKey(selection.anchor.key);
    return element;
  });
}

function getTriggerOffset(value: string, triggers = defaultTriggers) {
  for (let i = value.length; i >= 0; i--) {
    const char = value[i];
    if (char && triggers.includes(char)) return i;
  }
  return -1;
}

function getTriggerInPreviousChar(value: string, triggers = defaultTriggers) {
  const previousChar = value[value.length - 1];
  if (!previousChar) return null;
  const secondPreviousChar = value[value.length - 2];
  const isIsolated = !secondPreviousChar || /\s/.test(secondPreviousChar);
  if (!isIsolated) return null;
  if (triggers.includes(previousChar)) return previousChar;
  return null;
}

function getSearchValue(value: string, triggers = defaultTriggers) {
  const offset = getTriggerOffset(value, triggers);
  if (offset === -1) return "";
  return value.slice(offset + 1);
}
