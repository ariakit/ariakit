import {
  MouseEvent,
  KeyboardEvent as ReactKeyboardEvent,
  useCallback,
  useEffect,
  useRef,
  useState,
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
  KEY_ENTER_COMMAND,
  KEY_ESCAPE_COMMAND,
  KEY_TAB_COMMAND,
  LexicalEditor,
  TextNode,
} from "lexical";
import useLayoutEffect from "use-isomorphic-layout-effect";

export type ComboboxContentEditableProps = {
  isTrigger?: (props: { editor: LexicalEditor; trigger: string }) => boolean;
  getList?: (props: {
    editor: LexicalEditor;
    trigger: string | null;
  }) => string[];
  onItemClick?: (props: {
    event: MouseEvent<HTMLDivElement>;
    editor: LexicalEditor;
    trigger: string | null;
    item: string;
    searchValue: string;
    node?: TextNode;
  }) => void;
};

export function ComboboxContentEditable({
  isTrigger,
  getList = () => [],
  onItemClick = () => {},
}: ComboboxContentEditableProps) {
  const [trigger, setTrigger] = useState<string | null>(null);
  const anchorRectRef = useRef<() => DOMRect | null>(() => null);
  const combobox = useComboboxState({
    limit: 10,
    getAnchorRect: () => anchorRectRef.current(),
  });
  const [editor] = useLexicalComposerContext();

  if (!combobox.mounted && trigger) {
    setTrigger(null);
  }

  useLayoutEffect(() => {
    Promise.resolve(getList({ editor, trigger })).then(combobox.setList);
  }, [editor, trigger, combobox.setList]);

  // useEffect(() => {
  //   if (!combobox.visible) return;
  //   combobox.move(combobox.first());
  // }, [combobox.visible, combobox.move, combobox.first]);

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
      const triggerOffset = getTriggerOffset(value, editor, isTrigger);
      if (triggerOffset === -1) {
        combobox.hide();
      }
      const trigger = getTriggerInPreviousChar(value, editor, isTrigger);
      const selectionElement = getSelectionElement(editor);
      if (!selectionElement) return;
      if (!selectionElement.firstChild) return;
      const searchValue = getSearchValue(value, editor, isTrigger);
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
            onClick={(event) => {
              editor.update(() => {
                const selection = $getSelection();
                if (!$isRangeSelection(selection)) return;
                const value = getTextBeforeCursor(editor);
                const startOffset = getTriggerOffset(value, editor, isTrigger);
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
                onItemClick?.({
                  event,
                  editor,
                  trigger,
                  item,
                  searchValue: combobox.value,
                  node: nodeToReplace,
                });
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

function getTriggerOffset(
  value: string,
  editor: LexicalEditor,
  isTrigger: ComboboxContentEditableProps["isTrigger"]
) {
  for (let i = value.length; i >= 0; i--) {
    const trigger = value[i];
    if (trigger && isTrigger?.({ editor, trigger })) return i;
  }
  return -1;
}

function getTriggerInPreviousChar(
  value: string,
  editor: LexicalEditor,
  isTrigger: ComboboxContentEditableProps["isTrigger"]
) {
  const previousChar = value[value.length - 1];
  if (!previousChar) return null;
  const secondPreviousChar = value[value.length - 2];
  const isIsolated = !secondPreviousChar || /\s/.test(secondPreviousChar);
  if (!isIsolated) return null;
  if (isTrigger?.({ editor, trigger: previousChar })) return previousChar;
  return null;
}

function getSearchValue(
  value: string,
  editor: LexicalEditor,
  isTrigger: ComboboxContentEditableProps["isTrigger"]
) {
  const offset = getTriggerOffset(value, editor, isTrigger);
  if (offset === -1) return "";
  return value.slice(offset + 1);
}
