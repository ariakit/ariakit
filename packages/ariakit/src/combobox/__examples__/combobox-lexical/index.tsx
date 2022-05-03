import LexicalComposer from "@lexical/react/LexicalComposer";
import { HistoryPlugin } from "@lexical/react/LexicalHistoryPlugin";
import LexicalRichTextPlugin from "@lexical/react/LexicalRichTextPlugin";
import { $createHeadingNode, HeadingNode } from "@lexical/rich-text";
import { ComboboxContentEditable } from "./combobox-content-editable";
import { defaultTriggers, getList, getNode } from "./list";
import { MentionNode } from "./nodes";
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
    nodes: [MentionNode, HeadingNode],
  };

  return (
    <div className="wrapper">
      <LexicalComposer initialConfig={initialConfig}>
        <LexicalRichTextPlugin
          contentEditable={
            <ComboboxContentEditable
              isTrigger={(char, offset) =>
                defaultTriggers.includes(char) || (char === "/" && offset === 0)
              }
              getList={(trigger) => {
                if (trigger === "/") return ["Heading 1", "Heading 2"];
                return getList(trigger);
              }}
              getItemNode={(item, trigger) => {
                if (trigger === "/") {
                  switch (item) {
                    case "Heading 1":
                      return $createHeadingNode("h1");
                    case "Heading 2":
                      return $createHeadingNode("h2");
                    default:
                      return null;
                  }
                }
                return getNode(item, trigger);
              }}
            />
          }
          placeholder={<div className="placeholder">Enter some text...</div>}
        />
        <HistoryPlugin />
      </LexicalComposer>
    </div>
  );
}
