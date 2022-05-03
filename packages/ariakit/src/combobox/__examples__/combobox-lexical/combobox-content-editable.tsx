import {
  KeyboardEvent as ReactKeyboardEvent,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { $wrapLeafNodesInElements } from "@lexical/selection";
import { mergeRegister } from "@lexical/utils";
import {
  Combobox,
  ComboboxItem,
  ComboboxPopover,
  useComboboxState,
} from "ariakit/combobox";
import {
  $createTextNode,
  $getSelection,
  $isRangeSelection,
  $isTextNode,
  ElementNode,
  KEY_ENTER_COMMAND,
  KEY_ESCAPE_COMMAND,
  KEY_TAB_COMMAND,
  LexicalEditor,
  TextNode,
} from "lexical";
import useLayoutEffect from "use-isomorphic-layout-effect";

export type ComboboxContentEditableProps = {
  isTrigger?: (char: string, offset: number) => boolean;
  getList?: (trigger: string | null) => string[];
  getItemNode?: (
    item: string,
    trigger: string | null
  ) => ElementNode | TextNode | null;
};

export function ComboboxContentEditable({
  isTrigger,
  getList = () => [],
  getItemNode = () => null,
}: ComboboxContentEditableProps) {
  const [trigger, setTrigger] = useState<string | null>(null);
  const anchorRectRef = useRef<() => DOMRect | null>(() => null);
  const combobox = useComboboxState({
    limit: 10,
    getAnchorRect: () => anchorRectRef.current(),
  });
  const [editor] = useLexicalComposerContext();

  useLayoutEffect(() => {
    combobox.setList(getList(trigger));
  }, [combobox.setList, trigger]);

  if (!combobox.mounted && trigger) {
    setTrigger(null);
  }

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
      const triggerOffset = getTriggerOffset(value, isTrigger);
      if (triggerOffset === -1) {
        combobox.hide();
      }
      const trigger = getTriggerInPreviousChar(value, isTrigger);
      const selectionElement = getSelectionElement(editor);
      if (!selectionElement) return;
      if (!selectionElement.firstChild) return;
      const searchValue = getSearchValue(value, isTrigger);
      combobox.setValue(searchValue);
      const range = document.createRange();
      range.setStart(selectionElement.firstChild, triggerOffset + 1);
      range.collapse();
      combobox.anchorRef.current = selectionElement;
      anchorRectRef.current = () => range.getBoundingClientRect();
      if (trigger) {
        combobox.show();
        setTrigger(trigger);
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
        {combobox.matches.map((item) => (
          <ComboboxItem
            value={item}
            key={item}
            className="combobox-item"
            onClick={() => {
              editor.update(() => {
                const selection = $getSelection();
                if (!$isRangeSelection(selection)) return;
                const value = getTextBeforeCursor(editor);
                const startOffset = getTriggerOffset(value, isTrigger);
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
                const mentionNode = getItemNode(item, trigger);
                if (mentionNode && nodeToReplace) {
                  if ($isTextNode(mentionNode)) {
                    nodeToReplace.replace(mentionNode);
                    const space = $createTextNode(" ");
                    mentionNode.insertAfter(space);
                    space.select();
                  } else {
                    nodeToReplace!.remove();
                    $wrapLeafNodesInElements(selection, () => {
                      const node = getItemNode(item, trigger) as ElementNode;
                      return node;
                    });
                  }
                }
              });
            }}
          />
        ))}
      </ComboboxPopover>
    </>
  );
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

function defaultIsTrigger(_char: string, _offset: number) {
  return false;
}

function getTriggerOffset(value: string, isTrigger = defaultIsTrigger) {
  for (let i = value.length; i >= 0; i--) {
    const char = value[i];
    if (char && isTrigger(char, i)) return i;
  }
  return -1;
}

function getTriggerInPreviousChar(value: string, isTrigger = defaultIsTrigger) {
  const previousChar = value[value.length - 1];
  if (!previousChar) return null;
  const secondPreviousChar = value[value.length - 2];
  const isIsolated = !secondPreviousChar || /\s/.test(secondPreviousChar);
  if (!isIsolated) return null;
  if (isTrigger(previousChar, value.length - 1)) return previousChar;
  return null;
}

function getSearchValue(value: string, isTrigger = defaultIsTrigger) {
  const offset = getTriggerOffset(value, isTrigger);
  if (offset === -1) return "";
  return value.slice(offset + 1);
}
