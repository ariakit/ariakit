import {
  KeyboardEvent as ReactKeyboardEvent,
  useCallback,
  useEffect,
  useState,
} from "react";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { mergeRegister } from "@lexical/utils";
import { useEvent } from "ariakit-utils/hooks";
import {
  Combobox,
  ComboboxItem,
  ComboboxPopover,
  ComboboxState,
  useComboboxState,
} from "ariakit/combobox";
import {
  KEY_ENTER_COMMAND,
  KEY_ESCAPE_COMMAND,
  KEY_TAB_COMMAND,
  LexicalEditor,
  ParagraphNode,
  TextNode,
} from "lexical";
import useLayoutEffect from "use-isomorphic-layout-effect";
import {
  getSearchText,
  getSelectionAnchor,
  getSelectionElement,
  getTextBeforeCursor,
  getTriggerInPreviousChar,
  getTriggerOffset,
} from "./utils";

export type ComboboxContentEditableProps = {
  limit?: number;
  isTrigger?: (props: { editor: LexicalEditor; trigger: string }) => boolean;
  getList?: (props: {
    editor: LexicalEditor;
    trigger: string | null;
  }) => string[];
  onSelect?: (props: {
    editor: LexicalEditor;
    combobox: ComboboxState;
    trigger: string | null;
    item: string;
    node?: TextNode;
  }) => void;
};

function getItemValueById(items: ComboboxState["items"], id: string) {
  return items.find((item) => item.value && item.id === id)?.value;
}

function createRangeFromSelection(
  editor: LexicalEditor,
  start = 0,
  end = start
) {
  const selectionElement = getSelectionElement(editor);
  if (!selectionElement) return null;
  if (!selectionElement.firstChild) return null;
  const range = document.createRange();
  range.setStart(selectionElement.firstChild, start);
  range.setEnd(selectionElement.firstChild, end);
  return range;
}

export function ComboboxContentEditable({
  limit = 10,
  isTrigger: isTriggerProp,
  onSelect,
  getList = () => [],
}: ComboboxContentEditableProps) {
  isTriggerProp = useEvent(isTriggerProp);
  getList = useEvent(getList);

  const [editor] = useLexicalComposerContext();

  const isTrigger = useCallback(
    (trigger: string) => !!isTriggerProp?.({ editor, trigger }),
    [editor]
  );

  const [trigger, setTrigger] = useState<string | null>(null);
  const combobox = useComboboxState({
    limit,
    getAnchorRect: () => {
      const value = getTextBeforeCursor(editor);
      const triggerOffset = getTriggerOffset(value, isTrigger);
      const range = createRangeFromSelection(editor, triggerOffset + 1);
      return range?.getBoundingClientRect() || null;
    },
  });

  const hasMatches = !!combobox.matches.length;

  useLayoutEffect(() => {
    combobox.setVisible(hasMatches);
  }, [combobox.setVisible, hasMatches]);

  useLayoutEffect(() => {
    Promise.resolve(getList({ editor, trigger })).then(combobox.setList);
  }, [editor, trigger, combobox.setList]);

  const selectItem = useEvent((item: string) => {
    editor.update(() => {
      const anchor = getSelectionAnchor(editor);
      if (!anchor) return;
      const value = getTextBeforeCursor(editor);
      const startOffset = getTriggerOffset(value, isTrigger);
      const selectionOffset = startOffset + 1 + combobox.value.length;
      const anchorNode = anchor.getNode();
      const [a, b] = anchorNode.splitText(startOffset, selectionOffset);
      const node = startOffset === 0 ? a : b;
      onSelect?.({ editor, combobox, trigger, item, node });
    });
  });

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
          if (!combobox.activeId) return false;
          if (event) event.preventDefault();
          const value = getItemValueById(combobox.items, combobox.activeId);
          if (value) selectItem(value);
          return true;
        },
        1
      )
    );
  }, [editor, combobox.visible, combobox.activeId, combobox.items]);

  useEffect(() => {
    return editor.registerMutationListener(ParagraphNode, (nodes) => {
      for (const [key] of nodes) {
        const element = editor.getElementByKey(key);
        if (!element) continue;
        element.classList.toggle("empty", !element.textContent);
      }
    });
  }, [editor]);

  useEffect(() => {
    return editor.registerTextContentListener(() => {
      const value = getTextBeforeCursor(editor);
      const trigger = getTriggerInPreviousChar(value, isTrigger);
      const searchText = getSearchText(value, isTrigger);
      combobox.setValue(searchText);
      if (trigger) {
        setTrigger(trigger);
        combobox.show();
      } else if (!searchText) {
        setTrigger(null);
        combobox.hide();
      }
    });
  }, [editor, isTrigger, combobox.setValue, combobox.show, combobox.hide]);

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
            focusOnHover
            value={item}
            key={item}
            className="combobox-item"
            onClick={() => selectItem(item)}
          />
        ))}
      </ComboboxPopover>
    </>
  );
}
