import LexicalComposer from "@lexical/react/LexicalComposer";
import { HistoryPlugin } from "@lexical/react/LexicalHistoryPlugin";
import LexicalRichTextPlugin from "@lexical/react/LexicalRichTextPlugin";
import {
  ComboboxContentEditable,
  MentionNode,
} from "./combobox-content-editable";
import "./style.css";

const theme = {
  // Theme styling goes here
  // ...
};

export function Editor() {
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
          contentEditable={<ComboboxContentEditable />}
          placeholder={<div className="placeholder">Enter some text...</div>}
        />
        <HistoryPlugin />
      </LexicalComposer>
    </div>
  );
}
