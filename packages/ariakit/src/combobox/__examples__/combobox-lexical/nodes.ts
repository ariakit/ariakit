import { EditorConfig, LexicalNode, TextNode } from "lexical";

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
