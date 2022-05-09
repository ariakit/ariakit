import LexicalComposer from "@lexical/react/LexicalComposer";
import { HistoryPlugin } from "@lexical/react/LexicalHistoryPlugin";
import LexicalRichTextPlugin from "@lexical/react/LexicalRichTextPlugin";
import { $createHeadingNode, HeadingNode } from "@lexical/rich-text";
import { $wrapLeafNodesInElements } from "@lexical/selection";
import {
  $createTextNode,
  $getSelection,
  $isRangeSelection,
  ElementNode,
  LexicalEditor,
} from "lexical";
import { ComboboxContentEditable } from "./combobox-content-editable";
import { defaultTriggers, getList, getNode } from "./list";
import { MentionNode } from "./nodes";
import "./style.css";

const theme = {
  // Theme styling goes here
  // ...
};

function getText(editor: LexicalEditor) {
  return editor.getEditorState().read(() => {
    const selection = $getSelection();
    if (!$isRangeSelection(selection)) return "";
    const anchor = selection.anchor;
    if (anchor.type !== "text") return "";
    const anchorNode = anchor.getNode();
    if (!anchorNode.isSimpleText()) return "";
    return anchorNode.getTextContent();
  });
}

function getItemNode(item: string, trigger: string) {
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
}

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
              isTrigger={({ editor, trigger }) => {
                if (defaultTriggers.includes(trigger)) return true;
                return trigger === "/" && getText(editor) === "/";
              }}
              getList={({ editor, trigger }) => {
                if (trigger === "/" && getText(editor) === "/") {
                  return ["Heading 1", "Heading 2"];
                }
                return getList(trigger);
              }}
              onItemClick={({ editor, item, trigger, node }) => {
                if (!node) return;
                if (!trigger) return;
                const selection = $getSelection();
                if (!$isRangeSelection(selection)) return;
                if (trigger === "/" && getText(editor) === "/") {
                  node.remove();
                  $wrapLeafNodesInElements(
                    selection,
                    () => getItemNode(item, trigger) as ElementNode
                  );
                } else {
                  const nextNode = getItemNode(item, trigger);
                  if (!nextNode) return;
                  node.replace(nextNode);
                  const space = $createTextNode(" ");
                  nextNode.insertAfter(space);
                  space.select();
                }
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
