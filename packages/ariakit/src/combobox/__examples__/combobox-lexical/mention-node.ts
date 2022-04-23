import { EditorConfig, LexicalNode, TextNode } from "lexical";

export class MentionNode extends TextNode {
  __mention: string;

  static getType() {
    return "mention";
  }

  static clone(node: MentionNode) {
    return new MentionNode(node.__mention, node.__text, node.__key);
  }

  constructor(mentionName: string, text?: string, key?: string) {
    super(text ?? mentionName, key);
    this.__mention = mentionName;
  }

  createDOM(config: EditorConfig<Record<string, any>>) {
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
