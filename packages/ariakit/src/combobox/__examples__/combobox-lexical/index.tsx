import LexicalComposer from "@lexical/react/LexicalComposer";
import LexicalContentEditable from "@lexical/react/LexicalContentEditable";
import { HistoryPlugin } from "@lexical/react/LexicalHistoryPlugin";
import LexicalRichTextPlugin from "@lexical/react/LexicalRichTextPlugin";
import { MentionNode } from "./mention-node";
import MentionsPlugin from "./mentions-plugin";
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
          contentEditable={<LexicalContentEditable className="combobox" />}
          placeholder={<div className="placeholder">Enter some text...</div>}
        />
        <HistoryPlugin />
        <MentionsPlugin />
      </LexicalComposer>
    </div>
  );
}
