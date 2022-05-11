import LexicalComposer from "@lexical/react/LexicalComposer";
import { HistoryPlugin } from "@lexical/react/LexicalHistoryPlugin";
import LexicalRichTextPlugin from "@lexical/react/LexicalRichTextPlugin";
import { $wrapLeafNodesInElements } from "@lexical/selection";
import {
  $createParagraphNode,
  $createTextNode,
  $getSelection,
  $isRangeSelection,
  EditorThemeClasses,
  ElementNode,
  LexicalEditor,
} from "lexical";
import { ComboboxContentEditable } from "./combobox-content-editable";
import { defaultTriggers, getList, getNode } from "./list";
import {
  $createHeadingNode,
  $createQuoteNode,
  HeadingNode,
  QuoteNode,
  StyledNode,
} from "./nodes";
import { getTextBeforeCursor } from "./utils";
import "./style.css";

const theme: EditorThemeClasses = {
  quote: "editor-blockquote",
  paragraph: "editor-paragraph",
  heading: {
    h1: "editor-heading-1",
    h2: "editor-heading-2",
    h3: "editor-heading-3",
    h4: "editor-heading-4",
    h5: "editor-heading-5",
  },
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
      case "Blockquote":
        return $createQuoteNode();
      case "Heading 1":
        return $createHeadingNode("h1");
      case "Paragraph":
        return $createParagraphNode();
      case "Heading 2":
        return $createHeadingNode("h2");
      case "Heading 3":
        return $createHeadingNode("h3");
      case "Heading 4":
        return $createHeadingNode("h4");
      case "Heading 5":
        return $createHeadingNode("h5");
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
    nodes: [HeadingNode, QuoteNode, StyledNode],
  };

  return (
    <div className="wrapper">
      <LexicalComposer initialConfig={initialConfig}>
        <LexicalRichTextPlugin
          contentEditable={
            <ComboboxContentEditable
              isTrigger={({ editor, trigger }) => {
                if (defaultTriggers.includes(trigger)) return true;
                return (
                  trigger === "/" &&
                  getText(editor) === getTextBeforeCursor(editor)
                );
              }}
              getList={({ editor, trigger }) => {
                if (
                  trigger === "/" &&
                  getText(editor) === getTextBeforeCursor(editor)
                ) {
                  return [
                    "Blockquote",
                    "Heading 1",
                    "Paragraph",
                    "Heading 2",
                    "Heading 3",
                    "Heading 4",
                    "Heading 5",
                  ];
                }
                return getList(trigger);
              }}
              onSelect={({ editor, item, trigger, node }) => {
                if (!node) return;
                if (!trigger) return;
                const selection = $getSelection();
                if (!$isRangeSelection(selection)) return;
                if (
                  trigger === "/" &&
                  getText(editor) === getTextBeforeCursor(editor)
                ) {
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
          placeholder={null}
        />
        <HistoryPlugin />
      </LexicalComposer>
    </div>
  );
}
