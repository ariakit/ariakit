import { useCallback, useState } from "react";
import LexicalComposer from "@lexical/react/LexicalComposer";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { HistoryPlugin } from "@lexical/react/LexicalHistoryPlugin";
import LexicalRichTextPlugin from "@lexical/react/LexicalRichTextPlugin";
import { Combobox, useComboboxState } from "ariakit/combobox";
import { MentionNode } from "./mention-node";
import MentionsPlugin from "./mentions-plugin";
import "./style.css";

const theme = {
  // Theme styling goes here
  // ...
};

function Combo({ state }) {
  const [editor] = useLexicalComposerContext();
  const ref = useCallback(
    (rootElement: HTMLElement | null) => {
      editor.setRootElement(rootElement);
    },
    [editor]
  );
  return (
    <Combobox
      as="div"
      state={state}
      ref={ref}
      contentEditable
      className="combobox"
      // We'll overwrite how the combobox popover is shown, so we disable
      // the default behaviors.
      showOnChange={false}
      showOnKeyDown={false}
      showOnMouseDown={false}
      // To the combobox state, we'll only set the value after the trigger
      // character (the search value), so we disable the default behavior.
      setValueOnChange={false}
      // We need to re-calculate the position of the combobox popover when
      // the textarea contents are scrolled.
      onScroll={state.render}
      // Hide the combobox popover whenever the selection changes.
      onPointerDown={state.hide}
    />
  );
}

export function Editor() {
  const [anchorRect, setAnchorRect] = useState({ x: 0, y: 0, height: 0 });
  const combobox = useComboboxState({ getAnchorRect: () => anchorRect });
  const initialConfig = {
    theme,
    onError(error: Error) {
      throw error;
    },
    nodes: [MentionNode],
  };

  return (
    <div className="wrapper">
      <LexicalComposer initialConfig={initialConfig}>
        <LexicalRichTextPlugin
          contentEditable={<Combo state={combobox} />}
          placeholder={<div className="placeholder">Enter some text...</div>}
        />
        <HistoryPlugin />
        <MentionsPlugin state={combobox} setAnchorRect={setAnchorRect} />
      </LexicalComposer>
    </div>
  );
}
